namespace UscisApi;

public sealed class ResendOptions
{
    public string ApiKey { get; init; } = "";
    public string FromAddress { get; init; } = "";
    public string ToAddress { get; init; } = "";
    public int DailyLimit { get; init; } = 100;
}
