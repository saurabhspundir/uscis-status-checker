using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace UscisApi;

public sealed class ResendEmailSender(
    IHttpClientFactory httpClientFactory,
    IOptions<ResendOptions> options) : IEmailSender
{
    private readonly ResendOptions _options = options.Value;

    public async Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("resend");
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var payload = new
        {
            from = message.From,
            to = new[] { message.To },
            subject = message.Subject,
            text = message.Body,
        };

        var response = await client.PostAsJsonAsync("/emails", payload, ct);

        if (response.StatusCode == HttpStatusCode.TooManyRequests)
            throw new EmailRateLimitException();

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            var apiMessage = TryParseErrorMessage(body) ?? $"Resend API error: {(int)response.StatusCode}";

            if (string.Equals(TryParseErrorType(body), "rate_limit_exceeded", StringComparison.OrdinalIgnoreCase))
                throw new EmailRateLimitException();

            throw new EmailSendException(apiMessage);
        }
    }

    private static string? TryParseErrorMessage(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("message", out var msg))
                return msg.GetString();
        }
        catch { /* ignore parse errors */ }

        return null;
    }

    private static string? TryParseErrorType(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("name", out var name))
                return name.GetString();
        }
        catch { /* ignore parse errors */ }

        return null;
    }
}
