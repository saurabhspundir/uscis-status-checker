using Microsoft.Extensions.Options;
using Serilog;
using Uscis.Shared;
using UscisApi;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

builder.Services.Configure<OAuthOptions>(builder.Configuration.GetSection("OAuth"));
builder.Services.Configure<ApiOptions>(builder.Configuration.GetSection("Api"));
builder.Services.Configure<CaseStatusApiOptions>(builder.Configuration.GetSection("CaseStatusApi"));

var oauthBaseUrl = builder.Configuration["OAuth:BaseUrl"] ?? "https://api-int.uscis.gov";
var apiBaseUrl = builder.Configuration["Api:BaseUrl"] ?? "https://api-int.uscis.gov";

builder.Services.AddHttpClient("oauth", client =>
    client.BaseAddress = new Uri(oauthBaseUrl));

builder.Services.AddHttpClient("uscis", client =>
    client.BaseAddress = new Uri(apiBaseUrl));

builder.Services.AddSingleton<OAuthTokenProvider>();
builder.Services.AddSingleton<DailyRequestCounter>();
builder.Services.AddSingleton<IUscisClient, UscisClient>();

builder.Services.AddCors(options =>
    options.AddPolicy("LocalDev", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Local"))
{
    app.UseCors("LocalDev");
}
app.MapOpenApi();
app.MapCaseEndpoints();

app.Run();

public partial class Program { }
