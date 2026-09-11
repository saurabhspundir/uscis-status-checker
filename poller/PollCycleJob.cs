using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quartz;

namespace UscisApiPoller;

/// <summary>
/// Fires every Polling:IntervalSeconds (via its Quartz trigger) and enqueues one
/// case-status request per configured receipt number. The actual HTTP calls are
/// throttled separately by <see cref="RequestDispatchJob"/>.
/// </summary>
[DisallowConcurrentExecution]
public sealed class PollCycleJob : IJob
{
    private readonly CaseReceiptQueue _queue;
    private readonly RateLimitState _rateLimitState;
    private readonly ApiOptions _apiOptions;
    private readonly RunLimiter _runLimiter;
    private readonly ILogger<PollCycleJob> _logger;

    public PollCycleJob(
        CaseReceiptQueue queue,
        RateLimitState rateLimitState,
        IOptions<ApiOptions> apiOptions,
        RunLimiter runLimiter,
        ILogger<PollCycleJob> logger)
    {
        _queue = queue;
        _rateLimitState = rateLimitState;
        _apiOptions = apiOptions.Value;
        _runLimiter = runLimiter;
        _logger = logger;
    }

    public async ValueTask Execute(IJobExecutionContext context, CancellationToken cancellationToken)
    {
        _runLimiter.RecordPollCycle();

        var endpoints = EndpointCatalog.Build(_apiOptions.CaseStatusPathTemplate);

        if (_rateLimitState.IsPaused)
        {
            // Dispatch is stalled behind a 429 backoff, so whatever is already queued
            // hasn't drained yet. Replace it instead of appending another full batch of
            // the same receipt numbers on top - otherwise every poll cycle during the
            // pause piles on duplicates the dispatcher will just re-hit the quota with.
            _queue.Reset(endpoints);

            _logger.LogInformation(
                "Poll cycle: rate limit backoff active, reset queue to {Count} case status requests ({WithHist} with hist_case_status, {WithoutHist} without, {Bad} bad ids) instead of appending. Queue depth is now {QueueDepth}.",
                endpoints.Count,
                CaseReceiptNumbers.WithHistCaseStatus.Count,
                CaseReceiptNumbers.WithoutHistCaseStatus.Count,
                CaseReceiptNumbers.BadIds.Count,
                _queue.Count);
        }
        else
        {
            _queue.EnqueueRange(endpoints);

            _logger.LogInformation(
                "Poll cycle: enqueued {Count} case status requests ({WithHist} with hist_case_status, {WithoutHist} without, {Bad} bad ids). Queue depth is now {QueueDepth}.",
                endpoints.Count,
                CaseReceiptNumbers.WithHistCaseStatus.Count,
                CaseReceiptNumbers.WithoutHistCaseStatus.Count,
                CaseReceiptNumbers.BadIds.Count,
                _queue.Count);
        }

        if (_runLimiter.LimitReached)
        {
            // Stop scheduling further poll cycles - RequestDispatchJob keeps running on
            // its own trigger and will stop the host once it drains what's already queued.
            await context.Scheduler.UnscheduleJob(new TriggerKey("PollCycleTrigger"), cancellationToken);

            _logger.LogInformation(
                "Poll cycle: reached configured SandboxOperatingHours:MaxRunCount - no further poll cycles will run. Waiting for the dispatch queue to drain before exiting.");
        }
    }
}
