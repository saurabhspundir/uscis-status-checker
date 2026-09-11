namespace UscisApi;

public sealed class ApiOptions
{
    public string BaseUrl { get; init; } = string.Empty;
    public string CaseStatusPathTemplate { get; init; } = "/case-status/{0}";
}
