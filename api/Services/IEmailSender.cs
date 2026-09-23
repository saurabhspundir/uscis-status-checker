namespace UscisApi;

public sealed record EmailMessage(string To, string From, string Subject, string Body);

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct);
}
