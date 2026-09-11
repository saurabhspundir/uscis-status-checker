using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Uscis.Shared;

/// <summary>
/// Fetches and caches an OAuth client-credentials access token, refreshing it
/// either when it is about to expire or when the caller explicitly forces a refresh
/// (e.g. after a downstream 401).
/// </summary>
public sealed class OAuthTokenProvider(
    IHttpClientFactory httpClientFactory,
    IOptions<OAuthOptions> options,
    ILogger<OAuthTokenProvider> logger)
{
    private readonly OAuthOptions _options = options.Value;
    private readonly SemaphoreSlim _lock = new(1, 1);

    private string? _accessToken;
    private DateTimeOffset _expiresAtUtc = DateTimeOffset.MinValue;

    public async Task<string> GetAccessTokenAsync(bool forceRefresh, CancellationToken ct)
    {
        if (!forceRefresh && IsTokenValid())
        {
            return _accessToken!;
        }

        await _lock.WaitAsync(ct);
        try
        {
            // Another caller may have already refreshed while we waited on the lock.
            if (!forceRefresh && IsTokenValid())
            {
                return _accessToken!;
            }

            return await FetchTokenAsync(ct);
        }
        finally
        {
            _lock.Release();
        }
    }

    private bool IsTokenValid() => _accessToken is not null && DateTimeOffset.UtcNow < _expiresAtUtc;

    private async Task<string> FetchTokenAsync(CancellationToken ct)
    {
        logger.LogInformation("Requesting OAuth access token from {TokenPath}", _options.TokenPath);

        using var client = httpClientFactory.CreateClient("oauth");
        using var request = new HttpRequestMessage(HttpMethod.Post, _options.TokenPath)
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = _options.ClientId,
                ["client_secret"] = _options.ClientSecret,
                ["grant_type"] = "client_credentials",
            }),
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"OAuth token request failed with status {(int)response.StatusCode}: {body}");
        }

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        var accessToken = root.TryGetProperty("access_token", out var tokenProp)
            ? tokenProp.GetString()
            : null;

        if (string.IsNullOrEmpty(accessToken))
        {
            throw new InvalidOperationException("OAuth response did not contain an access_token.");
        }

        var expiresInSeconds = TryGetExpiresIn(root) ?? 3600;

        _accessToken = accessToken;
        // Refresh a bit before actual expiry so we don't race the token's edge.
        _expiresAtUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(30, expiresInSeconds - 30));

        logger.LogInformation("Obtained new OAuth access token, valid for {ExpiresIn}s", expiresInSeconds);

        return _accessToken;
    }

    private static double? TryGetExpiresIn(JsonElement root)
    {
        if (!root.TryGetProperty("expires_in", out var value))
        {
            return null;
        }

        return value.ValueKind switch
        {
            JsonValueKind.Number => value.GetDouble(),
            JsonValueKind.String when double.TryParse(value.GetString(), out var parsed) => parsed,
            _ => null,
        };
    }
}
