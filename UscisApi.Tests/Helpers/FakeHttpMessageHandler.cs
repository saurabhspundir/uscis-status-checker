namespace UscisApi.Tests.Helpers;

internal sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
    : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken) =>
        Task.FromResult(handler(request));
}

internal sealed class FakeHttpClientFactory(Dictionary<string, Func<HttpMessageHandler>> handlers)
    : IHttpClientFactory
{
    public HttpClient CreateClient(string name)
    {
        if (handlers.TryGetValue(name, out var handlerFactory))
            return new HttpClient(handlerFactory()) { BaseAddress = new Uri("https://api-int.uscis.gov") };

        return new HttpClient { BaseAddress = new Uri("https://api-int.uscis.gov") };
    }
}
