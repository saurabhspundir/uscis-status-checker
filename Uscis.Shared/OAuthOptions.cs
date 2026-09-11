namespace Uscis.Shared;

public sealed class OAuthOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string TokenPath { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}
