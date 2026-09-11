using System.Text.Json;

namespace UscisApiPoller;

/// <summary>Matches the documented ErrorRequest schema: { "code": number, "message": string }.</summary>
public sealed record ErrorResponse(int Code, string Message);

public static class ErrorResponseParser
{
    /// <summary>
    /// Tries to pull a human-readable message out of an error body. Handles the documented
    /// {code, message} shape as well as the Apigee gateway's {fault:{faultstring}} shape,
    /// which is what the sandbox actually returns for gateway-level rejections like 429s.
    /// </summary>
    public static ErrorResponse? TryParse(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("message", out var messageProp))
            {
                var code = root.TryGetProperty("code", out var codeProp) && codeProp.TryGetInt32(out var parsedCode)
                    ? parsedCode
                    : 0;
                return new ErrorResponse(code, messageProp.GetString() ?? "");
            }

            if (root.TryGetProperty("fault", out var fault) &&
                fault.TryGetProperty("faultstring", out var faultString))
            {
                return new ErrorResponse(0, faultString.GetString() ?? "");
            }
        }
        catch (JsonException)
        {
            // Not JSON, or not a shape we recognize - caller falls back to the raw body.
        }

        return null;
    }
}
