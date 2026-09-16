namespace UscisApi.Data;

public sealed class User
{
    public Guid Id { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsAdmin { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
