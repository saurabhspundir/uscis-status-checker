using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quartz;
using Serilog.Context;
using Uscis.Shared;

namespace UscisApiPoller;

/// <summary>
/// Fires at the configured TPS interval (via its Quartz trigger) and dequeues + calls
/// exactly one case-status request per tick. This is what actually enforces the
/// client-side rate limit - the queue can fill faster than this drains it, but the
/// drain rate itself never exceeds RateLimiting:TpsLimit.
/// </summary>
[DisallowConcurrentExecution]
public sealed class RequestDispatchJob : IJob
{
    private readonly CaseReceiptQueue _queue;
    private readonly RateLimitState _rateLimitState;
    private readonly OAuthTokenProvider _tokenProvider;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SandboxOperatingHoursChecker _hoursChecker;
    private readonly RateLimitOptions _rateLimitOptions;
    private readonly RunLimiter _runLimiter;
    private readonly ILogger<RequestDispatchJob> _logger;

    public RequestDispatchJob(
        CaseReceiptQueue queue,
        RateLimitState rateLimitState,
        OAuthTokenProvider tokenProvider,
        IHttpClientFactory httpClientFactory,
        SandboxOperatingHoursChecker hoursChecker,
        IOptions<RateLimitOptions> rateLimitOptions,
        RunLimiter runLimiter,
        ILogger<RequestDispatchJob> logger)
    {
        _queue = queue;
        _rateLimitState = rateLimitState;
        _tokenProvider = tokenProvider;
        _httpClientFactory = httpClientFactory;
        _hoursChecker = hoursChecker;
        _rateLimitOptions = rateLimitOptions.Value;
        _runLimiter = runLimiter;
        _logger = logger;
    }

    public async ValueTask Execute(IJobExecutionContext context, CancellationToken cancellationToken)
    {
        if (_rateLimitState.IsPaused)
        {
            return;
        }

        if (!_queue.TryDequeue(out var endpoint))
        {
            _runLimiter.NotifyQueueDrained();
            return;
        }

        try
        {
            await CallEndpointAsync(endpoint, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Request to endpoint {Endpoint} failed", endpoint.Name);
        }
    }

    private async Task CallEndpointAsync(EndpointOptions endpoint, CancellationToken cancellationToken)
    {
        var startTime = DateTimeOffset.UtcNow;

        try
        {
            using var client = _httpClientFactory.CreateClient("api");
            using var response = await BearerTokenRequestSender.SendAsync(
                client,
                () => BuildRequest(endpoint),
                _tokenProvider,
                cancellationToken);

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            var endTime = DateTimeOffset.UtcNow;
            LogApiCall(endpoint, startTime, endTime, (int)response.StatusCode);
            HandleResponse(endpoint, response, body);
        }
        catch (Exception)
        {
            LogApiCall(endpoint, startTime, DateTimeOffset.UtcNow, httpStatusCode: null);
            throw;
        }
    }

    /// <summary>
    /// Records one structured entry per API call (start/end time, case number, HTTP
    /// status) via the ApiCall-tagged Serilog sub-logger configured in appsettings.json
    /// (logs/api-calls-*.json), separate from the human-readable poller-*.log.
    /// </summary>
    private void LogApiCall(EndpointOptions endpoint, DateTimeOffset startTime, DateTimeOffset endTime, int? httpStatusCode)
    {
        using (LogContext.PushProperty("ApiCall", true))
        using (LogContext.PushProperty("CaseNumber", endpoint.ReceiptNumber))
        using (LogContext.PushProperty("EndpointName", endpoint.Name))
        using (LogContext.PushProperty("StartTime", startTime))
        using (LogContext.PushProperty("EndTime", endTime))
        using (LogContext.PushProperty("DurationMs", (endTime - startTime).TotalMilliseconds))
        using (LogContext.PushProperty("HttpStatusCode", httpStatusCode))
        {
            _logger.LogInformation(
                "API call {CaseNumber} ({Endpoint}) -> {HttpStatusCode} in {DurationMs} ms",
                endpoint.ReceiptNumber, endpoint.Name, httpStatusCode, (endTime - startTime).TotalMilliseconds);
        }
    }

    private void HandleResponse(EndpointOptions endpoint, HttpResponseMessage response, string body)
    {
        switch ((int)response.StatusCode)
        {
            case 200:
                _logger.LogInformation("{Endpoint} -> 200: {Body}", endpoint.Name, Truncate(body));
                break;

            case 404:
            {
                var error = ErrorResponseParser.TryParse(body);
                _logger.LogWarning(
                    "{Endpoint} -> 404: {Message} This is either an invalid receipt number or a case " +
                    "protected under 8 U.S.C. 1367 (returns 404 by design) - direct the user to the USCIS " +
                    "Contact Center at 1-800-375-5283.",
                    endpoint.Name, error?.Message ?? body);
                break;
            }

            case 422:
            {
                var error = ErrorResponseParser.TryParse(body);
                _logger.LogWarning(
                    "{Endpoint} -> 422 (badly formatted receipt number): {Message}",
                    endpoint.Name, error?.Message ?? body);
                break;
            }

            case 429:
            {
                var error = ErrorResponseParser.TryParse(body);
                _logger.LogWarning(
                    "{Endpoint} -> 429 rate limited: {Message} Backing off for {Backoff}s and re-queuing.",
                    endpoint.Name, error?.Message ?? body, _rateLimitOptions.BackoffSeconds);
                _rateLimitState.PauseFor(TimeSpan.FromSeconds(_rateLimitOptions.BackoffSeconds));
                _queue.Enqueue(endpoint);
                break;
            }

            case 503:
            {
                var withinOperatingHours = _hoursChecker.IsWithinOperatingHours(DateTimeOffset.UtcNow);
                if (withinOperatingHours)
                {
                    _logger.LogWarning(
                        "{Endpoint} -> 503 during the sandbox's published operating hours (M-F 7AM-8PM EST) - this looks like a genuine outage.",
                        endpoint.Name);
                }
                else
                {
                    _logger.LogInformation(
                        "{Endpoint} -> 503 outside the sandbox's published operating hours (M-F 7AM-8PM EST) - expected, not a bug.",
                        endpoint.Name);
                }

                break;
            }

            default:
                _logger.LogWarning("{Endpoint} -> {StatusCode}: {Body}", endpoint.Name, (int)response.StatusCode, Truncate(body));
                break;
        }
    }

    private static HttpRequestMessage BuildRequest(EndpointOptions endpoint)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, endpoint.Path);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return request;
    }

    private static string Truncate(string value, int maxLength = 500) =>
        value.Length <= maxLength ? value : string.Concat(value.AsSpan(0, maxLength), "...(truncated)");
}
