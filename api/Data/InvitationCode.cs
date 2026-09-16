namespace UscisApi.Data;

public sealed class InvitationCode
{
    public Guid Id { get; set; }
    public Guid Code { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; } // null = active indefinitely
}
