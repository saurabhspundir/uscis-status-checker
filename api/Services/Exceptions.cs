namespace UscisApi;

public sealed class RateLimitExceededException(string message) : Exception(message);

public sealed class UpstreamRateLimitException() : Exception("USCIS API returned 429");

public sealed class UscisApiException(int statusCode, string apiMessage) : Exception(apiMessage)
{
    public int StatusCode { get; } = statusCode;
    public string ApiMessage { get; } = apiMessage;
}
