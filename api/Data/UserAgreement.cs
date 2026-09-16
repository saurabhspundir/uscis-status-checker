namespace UscisApi.Data;

public sealed class UserAgreement
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DocumentType { get; set; } = string.Empty;  // "terms" | "privacy"
    public string Version { get; set; } = string.Empty;
    public DateTimeOffset AcceptedAt { get; set; }
}
