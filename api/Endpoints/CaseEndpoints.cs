using Microsoft.Extensions.Options;

namespace UscisApi;

public static class CaseEndpoints
{
    public static void MapCaseEndpoints(this WebApplication app)
    {
        app.MapGet("/api/case/{caseNumber}", HandleGetCaseStatus)
           .WithName("GetCaseStatus")
           .WithOpenApi();
    }

    private static async Task<IResult> HandleGetCaseStatus(
        string caseNumber,
        DailyRequestCounter counter,
        IUscisClient uscisClient,
        IOptions<CaseStatusApiOptions> options,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        if (!ReceiptNumberValidator.IsValid(caseNumber))
            return Results.BadRequest(new ApiErrorResponse(
                "Invalid receipt number format. Expected 3 letters followed by 10 digits."));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dailyLimit = options.Value.DailyLimit;

        if (!counter.TryIncrement(today, dailyLimit))
            return Results.Json(
                new ApiErrorResponse("Daily request limit reached.") { Limit = dailyLimit },
                statusCode: 429);

        try
        {
            var response = await uscisClient.GetCaseStatusAsync(caseNumber, ct);
            return Results.Ok(response);
        }
        catch (RateLimitExceededException)
        {
            return Results.Json(
                new ApiErrorResponse("Too many requests. Please wait before retrying."),
                statusCode: 429);
        }
        catch (UpstreamRateLimitException)
        {
            return Results.Json(
                new ApiErrorResponse("USCIS rate limit reached."),
                statusCode: 429);
        }
        catch (UscisApiException ex)
        {
            return Results.Json(new ApiErrorResponse(ex.ApiMessage), statusCode: ex.StatusCode);
        }
        catch (Exception ex)
        {
            var logger = loggerFactory.CreateLogger(nameof(CaseEndpoints));
            logger.LogError(ex, "Upstream service error for case {CaseNumber}", caseNumber);
            return Results.Json(
                new ApiErrorResponse("An error occurred contacting the upstream service."),
                statusCode: 502);
        }
    }
}
