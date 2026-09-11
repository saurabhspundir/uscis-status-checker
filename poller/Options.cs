namespace UscisApiPoller;

public sealed class PollingOptions
{
    public int IntervalSeconds { get; set; } = 30;
}

public sealed class EndpointOptions
{
    public string Name { get; set; } = "";
    public string Path { get; set; } = "";
    public string ReceiptNumber { get; set; } = "";
}

public sealed class ApiOptions
{
    public string BaseUrl { get; set; } = "";
    public string CaseStatusPathTemplate { get; set; } = "/case-status/{0}";
}

/// <summary>
/// Client-side throttling to stay under the sandbox's published rate limit (5 TPS)
/// and how long to back off after a 429 before resuming dispatch.
/// </summary>
public sealed class RateLimitOptions
{
    public int TpsLimit { get; set; } = 5;
    public int BackoffSeconds { get; set; } = 5;
}

/// <summary>
/// The sandbox's published operating window (M-F 7AM-8PM EST), expressed as a Quartz
/// cron expression, used to tell an expected 503 apart from a genuine outage.
/// </summary>
public sealed class SandboxHoursOptions
{
    public string CronExpression { get; set; } = "* * 7-19 ? * MON-FRI";
    public string TimeZoneId { get; set; } = "Eastern Standard Time";

    /// <summary>
    /// When greater than 0, the poller exits after this many poll cycles instead of
    /// running forever. Leave at 0 (or omit) to keep running on the normal cron schedule.
    /// </summary>
    public int MaxRunCount { get; set; } = 0;
}
