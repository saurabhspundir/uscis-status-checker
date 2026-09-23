using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace UscisApi;

public static class AccessRequestEndpoints
{
    private static readonly Regex EmailPattern = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    public static void MapAccessRequestEndpoints(this WebApplication app)
    {
        app.MapPost("/api/access-requests", HandleRequestAccess)
           .WithName("RequestAccess")
           .WithOpenApi()
           .AllowAnonymous();
    }

    private record AccessRequestBody(string Name, string Email, string Reason);

    private static async Task<IResult> HandleRequestAccess(
        AccessRequestBody request,
        EmailRequestCounter counter,
        IEmailSender emailSender,
        IOptions<ResendOptions> options,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Reason))
            return Results.BadRequest(new ApiErrorResponse("Name, email, and reason are required."));

        if (!EmailPattern.IsMatch(request.Email))
            return Results.BadRequest(new ApiErrorResponse("Invalid email address."));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dailyLimit = options.Value.DailyLimit;

        if (!counter.TryIncrement(today, dailyLimit))
            return Results.Json(
                new ApiErrorResponse("Daily request limit reached.") { Limit = dailyLimit },
                statusCode: 429);

        var message = new EmailMessage(
            To: options.Value.ToAddress,
            From: options.Value.FromAddress,
            Subject: $"Access request from {request.Name}",
            Body: $"Name: {request.Name}\nEmail: {request.Email}\nReason: {request.Reason}");

        try
        {
            await emailSender.SendAsync(message, ct);
        }
        catch (EmailRateLimitException)
        {
            return Results.Json(
                new ApiErrorResponse("Daily request limit reached.") { Limit = dailyLimit },
                statusCode: 429);
        }
        catch (EmailSendException ex)
        {
            var logger = loggerFactory.CreateLogger(nameof(AccessRequestEndpoints));
            logger.LogError("Failed to send access-request email for {Email}: {Message}", request.Email, ex.Message);
            return Results.Json(
                new ApiErrorResponse("Something went wrong. Please try again later."),
                statusCode: 502);
        }

        return Results.Ok(new { message = "Request received." });
    }
}
