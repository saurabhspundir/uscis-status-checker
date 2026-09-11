using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;
using Uscis.Shared;

namespace UscisApi;

public sealed class UscisClient : IAsyncDisposable
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ApiOptions _apiOptions;
    private readonly OAuthTokenProvider _tokenProvider;
    private readonly ILogger<UscisClient> _logger;
    private readonly TokenBucketRateLimiter _rateLimiter;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public UscisClient(
        IHttpClientFactory httpClientFactory,
        IOptions<ApiOptions> apiOptions,
        IOptions<CaseStatusApiOptions> caseStatusApiOptions,
        OAuthTokenProvider tokenProvider,
        ILogger<UscisClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apiOptions = apiOptions.Value;
        _tokenProvider = tokenProvider;
        _logger = logger;

        var rpm = caseStatusApiOptions.Value.ThrottleRequestsPerMinute;
        _rateLimiter = new TokenBucketRateLimiter(new TokenBucketRateLimiterOptions
        {
            TokenLimit = rpm,
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            ReplenishmentPeriod = TimeSpan.FromMinutes(1),
            TokensPerPeriod = rpm,
            AutoReplenishment = true
        });
    }

    public async Task<CaseStatusResponse> GetCaseStatusAsync(string receiptNumber, CancellationToken ct)
    {
        using var lease = await _rateLimiter.AcquireAsync(1, ct);
        if (!lease.IsAcquired)
            throw new RateLimitExceededException("Outbound rate limit exceeded");

        var client = _httpClientFactory.CreateClient("uscis");
        var path = string.Format(_apiOptions.CaseStatusPathTemplate, receiptNumber);
        var response = await BearerTokenRequestSender.SendAsync(
            client,
            () => new HttpRequestMessage(HttpMethod.Get, path),
            _tokenProvider,
            ct);

        return await HandleResponseAsync(response, ct);
    }

    private async Task<CaseStatusResponse> HandleResponseAsync(HttpResponseMessage response, CancellationToken ct)
    {
        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            throw new UpstreamRateLimitException();

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            var message = TryParseErrorMessage(body) ?? $"USCIS API error: {(int)response.StatusCode}";
            throw new UscisApiException((int)response.StatusCode, message);
        }

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<CaseStatusResponse>(json, _jsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize USCIS response");
    }

    private static string? TryParseErrorMessage(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("message", out var msg))
                return msg.GetString();

            if (root.TryGetProperty("fault", out var fault) &&
                fault.TryGetProperty("faultstring", out var faultStr))
                return faultStr.GetString();
        }
        catch { /* ignore parse errors */ }

        return null;
    }

    public async ValueTask DisposeAsync()
    {
        await _rateLimiter.DisposeAsync();
    }
}
