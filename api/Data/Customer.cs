namespace UscisApi.Data;

public sealed class Customer
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "interested"; // "interested" | "invited" | "converted"
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? InvitedAt { get; set; }
    public DateTimeOffset? ConvertedAt { get; set; }
    public Guid? ConvertedUserId { get; set; } // FK -> User.Id
}
