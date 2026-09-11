namespace UscisApi;

public sealed class CaseStatusApiOptions
{
    public int DailyLimit { get; init; } = 100;
    public int ThrottleRequestsPerMinute { get; init; } = 30;
}
