namespace UscisApi;

public sealed record ApiErrorResponse(string Error)
{
    public int? Limit { get; init; }
    public int? Count { get; init; }
}
