using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using NSubstitute;
using Uscis.Shared;
using UscisApi.Tests.Helpers;

namespace UscisApi.Tests;

public class UscisClientTests
{
    private static readonly OAuthOptions DefaultOAuthOptions = new()
    {
        ClientId = "test-id",
        ClientSecret = "test-secret",
        TokenPath = "/oauth/accesstoken",
        BaseUrl = "https://api-int.uscis.gov"
    };

    private static readonly ApiOptions DefaultApiOptions = new()
    {
        CaseStatusPathTemplate = "/case-status/{0}"
    };

    private static readonly CaseStatusApiOptions DefaultCaseOptions = new()
    {
        ThrottleRequestsPerMinute = 100,
        DailyLimit = 100
    };

    private static HttpResponseMessage OkTokenResponse() =>
        new(HttpStatusCode.OK)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { access_token = "tok", expires_in = 3600 }),
                Encoding.UTF8, "application/json")
        };

    private static UscisClient BuildClient(
        Func<HttpRequestMessage, HttpResponseMessage> apiHandler,
        Func<HttpRequestMessage, HttpResponseMessage>? oauthHandler = null)
    {
        oauthHandler ??= _ => OkTokenResponse();

        var factory = new FakeHttpClientFactory(new Dictionary<string, Func<HttpMessageHandler>>
        {
            ["oauth"] = () => new FakeHttpMessageHandler(oauthHandler),
            ["uscis"] = () => new FakeHttpMessageHandler(apiHandler)
        });

        var tokenProvider = new OAuthTokenProvider(
            factory,
            Options.Create(DefaultOAuthOptions),
            NullLogger<OAuthTokenProvider>.Instance);

        return new UscisClient(
            factory,
            Options.Create(DefaultApiOptions),
            Options.Create(DefaultCaseOptions),
            tokenProvider,
            NullLogger<UscisClient>.Instance);
    }

    [Fact]
    public async Task GetCaseStatusAsync_SuccessResponse_ReturnsParsedStatus()
    {
        var json = JsonSerializer.Serialize(new
        {
            case_status = new { receiptNumber = "ABC1234567890", formType = "I-485" }
        });

        await using var client = BuildClient(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        });

        var result = await client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None);

        Assert.Equal("ABC1234567890", result.CaseStatus?.ReceiptNumber);
        Assert.Equal("I-485", result.CaseStatus?.FormType);
    }

    [Fact]
    public async Task GetCaseStatusAsync_429Response_ThrowsUpstreamRateLimitException()
    {
        await using var client = BuildClient(
            _ => new HttpResponseMessage(HttpStatusCode.TooManyRequests));

        await Assert.ThrowsAsync<UpstreamRateLimitException>(
            () => client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None));
    }

    [Fact]
    public async Task GetCaseStatusAsync_ErrorResponseWithMessageField_ThrowsUscisApiExceptionWithMessage()
    {
        var body = JsonSerializer.Serialize(new { message = "Case not found" });

        await using var client = BuildClient(_ => new HttpResponseMessage(HttpStatusCode.NotFound)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        });

        var ex = await Assert.ThrowsAsync<UscisApiException>(
            () => client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None));

        Assert.Equal(404, ex.StatusCode);
        Assert.Equal("Case not found", ex.ApiMessage);
    }

    [Fact]
    public async Task GetCaseStatusAsync_ErrorResponseWithFaultBody_ThrowsUscisApiExceptionWithFaultString()
    {
        var body = JsonSerializer.Serialize(new { fault = new { faultstring = "Service unavailable" } });

        await using var client = BuildClient(_ => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        });

        var ex = await Assert.ThrowsAsync<UscisApiException>(
            () => client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None));

        Assert.Equal(503, ex.StatusCode);
        Assert.Equal("Service unavailable", ex.ApiMessage);
    }

    [Fact]
    public async Task GetCaseStatusAsync_ErrorResponseWithUnparsableBody_ThrowsUscisApiExceptionWithFallbackMessage()
    {
        await using var client = BuildClient(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("not json", Encoding.UTF8, "text/plain")
        });

        var ex = await Assert.ThrowsAsync<UscisApiException>(
            () => client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None));

        Assert.Equal(500, ex.StatusCode);
        Assert.Contains("500", ex.ApiMessage);
    }

    [Fact]
    public async Task GetCaseStatusAsync_401Response_RetriesWithRefreshedToken()
    {
        var callCount = 0;

        await using var client = BuildClient(request =>
        {
            callCount++;
            if (callCount == 1)
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);

            var json = JsonSerializer.Serialize(new
            {
                case_status = new { receiptNumber = "ABC1234567890" }
            });
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
        });

        var result = await client.GetCaseStatusAsync("ABC1234567890", CancellationToken.None);

        Assert.Equal(2, callCount);
        Assert.Equal("ABC1234567890", result.CaseStatus?.ReceiptNumber);
    }
}
