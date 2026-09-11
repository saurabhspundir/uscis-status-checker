namespace UscisApi;

public interface IUscisClient
{
    Task<CaseStatusResponse> GetCaseStatusAsync(string receiptNumber, CancellationToken ct);
}
