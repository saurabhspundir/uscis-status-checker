using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using UscisApi.Data;

namespace UscisApi;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/google", HandleGoogleLogin)
           .WithName("GoogleLogin")
           .WithOpenApi()
           .AllowAnonymous();
    }

    private record GoogleLoginRequest(string IdToken, string? InvitationCode);

    private static async Task<IResult> HandleGoogleLogin(
        GoogleLoginRequest request,
        AppDbContext db,
        JwtService jwtService,
        IOptions<GoogleOptions> googleOptions,
        CancellationToken ct)
    {
        // 1. Validate Google ID token
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [googleOptions.Value.ClientId]
                });
        }
        catch (InvalidJwtException)
        {
            return Results.BadRequest(new { error = "Invalid Google token." });
        }

        var sub = payload.Subject;
        var email = payload.Email;
        var displayName = payload.Name;
        var avatarUrl = payload.Picture;

        // 2. Look up existing user
        var user = await db.Users.FirstOrDefaultAsync(
            u => u.ExternalId == sub && u.Provider == "google", ct);

        if (user is not null)
        {
            var token = jwtService.Issue(user);
            return Results.Ok(BuildResponse(token, user));
        }

        // 3. New user — require invitation code
        if (string.IsNullOrWhiteSpace(request.InvitationCode))
        {
            return Results.Json(new { requiresInvitation = true }, statusCode: 403);
        }

        // 4. Validate invitation code against invitation_codes table
        if (!Guid.TryParse(request.InvitationCode, out var inviteGuid))
        {
            return Results.BadRequest(new { error = "Invalid invitation code." });
        }

        var now = DateTimeOffset.UtcNow;
        var codeValid = await db.InvitationCodes.AnyAsync(
            c => c.Code == inviteGuid && (c.ExpiresAt == null || c.ExpiresAt > now), ct);

        if (!codeValid)
        {
            return Results.BadRequest(new { error = "Invalid invitation code." });
        }

        // 5. Create new user
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            ExternalId = sub,
            Provider = "google",
            Email = email,
            DisplayName = displayName,
            AvatarUrl = avatarUrl,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        db.Users.Add(newUser);
        await db.SaveChangesAsync(ct);

        // 6. Mark matching Customer as converted (if any)
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Email == email, ct);
        if (customer is not null && customer.ConvertedUserId is null)
        {
            customer.Status = "converted";
            customer.ConvertedAt = DateTimeOffset.UtcNow;
            customer.ConvertedUserId = newUser.Id;
            await db.SaveChangesAsync(ct);
        }

        var newToken = jwtService.Issue(newUser);
        return Results.Ok(BuildResponse(newToken, newUser));
    }

    private static object BuildResponse(string token, User user) => new
    {
        token,
        user = new
        {
            id = user.Id,
            email = user.Email,
            displayName = user.DisplayName,
            avatarUrl = user.AvatarUrl,
            isAdmin = user.IsAdmin,
        }
    };
}
