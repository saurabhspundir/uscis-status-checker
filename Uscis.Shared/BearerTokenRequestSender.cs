using System.Net;
using System.Net.Http.Headers;

namespace Uscis.Shared;

/// <summary>
/// Sends a request with a Bearer token obtained from <see cref="OAuthTokenProvider"/>,
/// and if the downstream call comes back 401, forces a token refresh and retries once.
/// </summary>
public static class BearerTokenRequestSender
{
    public static async Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        Func<HttpRequestMessage> requestFactory,
        OAuthTokenProvider tokenProvider,
        CancellationToken ct)
    {
        var token = await tokenProvider.GetAccessTokenAsync(forceRefresh: false, ct);
        var response = await SendWithTokenAsync(client, requestFactory(), token, ct);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            response.Dispose();
            token = await tokenProvider.GetAccessTokenAsync(forceRefresh: true, ct);
            response = await SendWithTokenAsync(client, requestFactory(), token, ct);
        }

        return response;
    }

    private static Task<HttpResponseMessage> SendWithTokenAsync(
        HttpClient client, HttpRequestMessage request, string token, CancellationToken ct)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request, ct);
    }
}
