using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace UscisApiPoller;

/// <summary>
/// When SandboxOperatingHours:MaxRunCount is set (greater than 0), stops polling after
/// that many poll cycles and shuts the host down once the dispatch queue those cycles
/// filled has fully drained. Leave at 0 (or omit) to keep the poller running
/// continuously on its normal Quartz cron schedule.
/// </summary>
public sealed class RunLimiter
{
    private readonly int _maxRunCount;
    private readonly IHostApplicationLifetime _lifetime;
    private readonly ILogger<RunLimiter> _logger;
    private int _runCount;
    private int _stopped;

    public RunLimiter(IOptions<SandboxHoursOptions> options, IHostApplicationLifetime lifetime, ILogger<RunLimiter> logger)
    {
        _maxRunCount = options.Value.MaxRunCount;
        _lifetime = lifetime;
        _logger = logger;
    }

    public bool LimitReached => _maxRunCount > 0 && Volatile.Read(ref _runCount) >= _maxRunCount;

    public void RecordPollCycle()
    {
        if (_maxRunCount <= 0)
        {
            return;
        }

        Interlocked.Increment(ref _runCount);
    }

    /// <summary>
    /// Called by the dispatch job whenever it finds the queue empty. Once the poll-cycle
    /// limit has been reached and there is nothing left to dispatch, stops the host.
    /// </summary>
    public void NotifyQueueDrained()
    {
        if (!LimitReached)
        {
            return;
        }

        if (Interlocked.Exchange(ref _stopped, 1) == 0)
        {
            _logger.LogInformation(
                "Reached configured SandboxOperatingHours:MaxRunCount of {MaxRunCount} poll cycles and the dispatch queue has drained - stopping.",
                _maxRunCount);
            _lifetime.StopApplication();
        }
    }
}
