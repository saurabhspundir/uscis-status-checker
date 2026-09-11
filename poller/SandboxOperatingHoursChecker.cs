using Microsoft.Extensions.Options;
using Quartz;

namespace UscisApiPoller;

/// <summary>
/// Wraps the configured Quartz cron expression for the sandbox's published operating
/// window (M-F 7AM-8PM EST) so a 503 can be classified as expected-downtime vs. a
/// genuine outage.
/// </summary>
public sealed class SandboxOperatingHoursChecker
{
    private readonly CronExpression _cronExpression;

    public SandboxOperatingHoursChecker(IOptions<SandboxHoursOptions> options)
    {
        var opts = options.Value;
        _cronExpression = new CronExpression(opts.CronExpression, TimeZoneInfo.FindSystemTimeZoneById(opts.TimeZoneId));
    }

    public bool IsWithinOperatingHours(DateTimeOffset timestamp) => _cronExpression.IsSatisfiedBy(timestamp);
}
