using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quartz;
using Serilog;
using Uscis.Shared;
using UscisApiPoller;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Services.AddSerilog((services, loggerConfiguration) => loggerConfiguration
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services));

builder.Services.Configure<PollingOptions>(builder.Configuration.GetSection("Polling"));
builder.Services.Configure<OAuthOptions>(builder.Configuration.GetSection("OAuth"));
builder.Services.Configure<ApiOptions>(builder.Configuration.GetSection("Api"));
builder.Services.Configure<RateLimitOptions>(builder.Configuration.GetSection("RateLimiting"));
builder.Services.Configure<SandboxHoursOptions>(builder.Configuration.GetSection("SandboxOperatingHours"));

builder.Services.AddHttpClient("oauth", (sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<OAuthOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
});

builder.Services.AddHttpClient("api", (sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<ApiOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
});

builder.Services.AddSingleton<OAuthTokenProvider>();
builder.Services.AddSingleton<CaseReceiptQueue>();
builder.Services.AddSingleton<RateLimitState>();
builder.Services.AddSingleton<SandboxOperatingHoursChecker>();
builder.Services.AddSingleton<RunLimiter>();

var pollingIntervalSeconds = builder.Configuration.GetValue("Polling:IntervalSeconds", 30);
var tpsLimit = Math.Max(1, builder.Configuration.GetValue("RateLimiting:TpsLimit", 5));
var dispatchIntervalMs = Math.Max(1, (int)Math.Round(1000.0 / tpsLimit));

builder.Services.AddQuartz(q =>
{
    var pollCycleJobKey = new JobKey("PollCycleJob");
    q.AddJob<PollCycleJob>(opts => opts.WithIdentity(pollCycleJobKey));
    q.AddTrigger(opts => opts
        .ForJob(pollCycleJobKey)
        .WithIdentity("PollCycleTrigger")
        .StartNow()
        .WithSimpleSchedule(x => x
            .WithInterval(TimeSpan.FromSeconds(pollingIntervalSeconds))
            .RepeatForever()));

    var dispatchJobKey = new JobKey("RequestDispatchJob");
    q.AddJob<RequestDispatchJob>(opts => opts.WithIdentity(dispatchJobKey));
    q.AddTrigger(opts => opts
        .ForJob(dispatchJobKey)
        .WithIdentity("RequestDispatchTrigger")
        .StartNow()
        .WithSimpleSchedule(x => x
            .WithInterval(TimeSpan.FromMilliseconds(dispatchIntervalMs))
            .RepeatForever()));
});

builder.Services.AddQuartzHostedService(opts => opts.WaitForJobsToComplete = true);

var host = builder.Build();
await host.RunAsync();
