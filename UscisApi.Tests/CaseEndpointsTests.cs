using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace UscisApi.Tests;

public class CaseEndpointsTests
{
    // Creates a fresh test server for each test, substituting IUscisClient.
    private static HttpClient BuildTestClient(
        IUscisClient? uscisClient = null,
        Action<IServiceCollection>? configureServices = null)
    {
        uscisClient ??= Substitute.For<IUscisClient>();

        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Override the singleton registered in Program.cs with our substitute.
                    services.AddSingleton(uscisClient);
                    configureServices?.Invoke(services);
                });
            });

        return factory.CreateClient();
    }

    // --- Receipt number validation ---

    [Theory]
    [InlineData("AB1234567890")]   // 2 letters
    [InlineData("ABCD123456789")]  // 4 letters
    [InlineData("ABC123456789")]   // 9 digits
    [InlineData("ABC-1234567890")] // hyphen
    public async Task GetCaseStatus_InvalidReceiptNumber_Returns400(string caseNumber)
    {
        using var client = BuildTestClient();

        var response = await client.GetAsync($"/api/case/{caseNumber}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Happy path ---

    [Fact]
    public async Task GetCaseStatus_ValidRequest_Returns200WithBody()
    {
        var uscisClient = Substitute.For<IUscisClient>();
        uscisClient
            .GetCaseStatusAsync("ABC1234567890", Arg.Any<CancellationToken>())
            .Returns(new CaseStatusResponse
            {
                CaseStatus = new CaseStatusDetail { ReceiptNumber = "ABC1234567890" }
            });

        using var client = BuildTestClient(uscisClient);

        var response = await client.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // --- Daily limit ---

    [Fact]
    public async Task GetCaseStatus_DailyLimitExhausted_Returns429()
    {
        // Register a counter that is already at the limit by pre-filling it.
        var counter = new DailyRequestCounter();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        counter.TryIncrement(today, dailyLimit: 1); // fills the single slot

        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddSingleton(Substitute.For<IUscisClient>());
                    // Replace the singleton counter with our pre-filled one.
                    services.AddSingleton(counter);
                });
            });

        using var client = factory.CreateClient();

        // The counter is already full — limit set to 1 inside the endpoint via options.
        // We need to also patch the options so the endpoint sees DailyLimit = 1.
        var factory2 = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, cfg) =>
                    cfg.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["CaseStatusApi:DailyLimit"] = "0"
                    }));
                builder.ConfigureServices(services =>
                    services.AddSingleton(Substitute.For<IUscisClient>()));
            });

        using var client2 = factory2.CreateClient();

        var response = await client2.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    // --- Exception mapping ---

    [Fact]
    public async Task GetCaseStatus_RateLimitExceededException_Returns429()
    {
        var uscisClient = Substitute.For<IUscisClient>();
        uscisClient
            .GetCaseStatusAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new RateLimitExceededException("rate limit exceeded"));

        using var client = BuildTestClient(uscisClient);

        var response = await client.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task GetCaseStatus_UpstreamRateLimitException_Returns429()
    {
        var uscisClient = Substitute.For<IUscisClient>();
        uscisClient
            .GetCaseStatusAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new UpstreamRateLimitException());

        using var client = BuildTestClient(uscisClient);

        var response = await client.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Theory]
    [InlineData(404)]
    [InlineData(503)]
    public async Task GetCaseStatus_UscisApiException_ReturnsUpstreamStatusCode(int statusCode)
    {
        var uscisClient = Substitute.For<IUscisClient>();
        uscisClient
            .GetCaseStatusAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new UscisApiException(statusCode, "upstream error"));

        using var client = BuildTestClient(uscisClient);

        var response = await client.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(statusCode, (int)response.StatusCode);
    }

    [Fact]
    public async Task GetCaseStatus_UnexpectedException_Returns502()
    {
        var uscisClient = Substitute.For<IUscisClient>();
        uscisClient
            .GetCaseStatusAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("something went wrong"));

        using var client = BuildTestClient(uscisClient);

        var response = await client.GetAsync("/api/case/ABC1234567890");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }
}
