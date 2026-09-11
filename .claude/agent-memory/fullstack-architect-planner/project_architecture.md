---
name: USCIS Status Checker — Project Architecture
description: Monorepo structure, existing poller conventions, api/client projects, Docker infrastructure, and key architectural decisions
type: project
---

Monorepo root: C:\dev\uscis-api. Three projects: poller/ (background Quartz scheduler), api/ (ASP.NET Core Minimal API), client/ (Vite+React+TS frontend). Shared library: Uscis.Shared/ (extracted as of the docker branch).

**Why:** Extending a background poller service with an interactive web API and UI layer, containerised with Docker.

**How to apply:** When planning any new backend work, align with the conventions established in poller/ and api/. The shared library Uscis.Shared is the canonical home for cross-cutting OAuth/HTTP transport logic.

## Uscis.Shared library (extracted in docker branch)
- Contains: OAuthTokenProvider, OAuthOptions, BearerTokenRequestSender
- BearerTokenRequestSender: static class, `Func<HttpRequestMessage> requestFactory` pattern to avoid reusing disposed requests on retry; currently accepts OAuthTokenProvider (concrete type, not interface — tracked as deferred issue D1)
- OAuthTokenProvider: Singleton, SemaphoreSlim thread safety, 30s early-refresh margin (hardcoded, tracked as D4), handles both numeric and string expires_in

## poller/ conventions
- .NET 10, `net10.0` TFM, nullable+implicit usings enabled
- Namespace: `UscisApiPoller`
- DI pattern: services registered in Program.cs top-level statements
- Options pattern: strongly-typed options classes, bound via `Configure<T>(config.GetSection("Key"))`
- HTTP clients: named clients ("oauth", "api") registered via `AddHttpClient`
  - KNOWN ISSUE (deferred): AddHttpClient delegates use builder.Configuration.GetSection(...).Get<T>() instead of IOptions<T> from sp — must be fixed before merge
- ReceiptNumberValidator: static partial class, `[GeneratedRegex]`, pattern `^[A-Za-z]{3}[0-9]{10}$`
- ErrorResponseParser: handles both `{code, message}` and Apigee `{fault:{faultstring}}` error shapes
- Serilog: console + rolling file + separate api-calls JSON file filtered by ApiCall = true enricher property
- RequestDispatchJob: decorated with [DisallowConcurrentExecution], handles 429 backoff + re-queue
- appsettings.json sections: Serilog, Polling, OAuth, Api, RateLimiting, SandboxOperatingHours

## api/ project
- Namespace: `UscisApi`
- Minimal API, endpoint registered at `/api/case/{caseNumber}` in CaseEndpoints.cs
- Options: OAuthOptions, ApiOptions, CaseStatusApiOptions { DailyLimit, ThrottleRequestsPerMinute }
- Rate limiting: TokenBucketRateLimiter inside UscisClient (outbound, not inbound middleware)
- DailyRequestCounter: Singleton, ConcurrentDictionary<DateOnly, int>
  - KNOWN BUG (required fix before merge): two-step AddOrUpdate/decrement is not atomic — race condition allows limit to be exceeded under concurrent load
- UscisClient: Singleton, implements IAsyncDisposable, holds TokenBucketRateLimiter, registered as concrete type (IUscisClient interface tracked as deferred D2)
- CORS: AllowAnyOrigin policy "LocalDev" registered but applied unconditionally (must be guarded by IsDevelopment() — required fix before merge)
- 502 handler in CaseEndpoints leaks ex.Message to client — must be fixed before merge

## client/ project
- Vite + React + TypeScript
- API integration: `client/src/api/uscisApi.ts` — BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
- In production, VITE_API_BASE_URL is set to "" (empty string) at build time, producing relative URLs — this is intentional and correct
- In dev, VITE_API_BASE_URL = http://localhost:5200

## Docker infrastructure (docker branch)
- docker-compose.yml: base compose with service definitions
- docker-compose.dev.yml: override for dev — dotnet watch, bind mount .:/src (overly broad, tracked as D3), named volumes for obj/bin
- docker-compose.prod.yml: override for prod — resource limits, ASPNETCORE_ENVIRONMENT=Production, VITE_API_BASE_URL=""
- nginx.conf: SPA server on port 80, /api/ proxied to http://api:8080 — path is preserved (correct), proxy_read_timeout missing (required fix before merge)
- Production nginx proxy chain: browser -> nginx:80 -> api:8080, with relative URLs from client — VALIDATED AS CORRECT

## Secret management (current state — has known issues)
- No formal secrets strategy exists
- .env.dev was committed with live credentials in docker branch (credentials must be rotated)
- docker-compose.dev.yml had hardcoded credential fallbacks (:-value syntax) — must be changed to :? fail-fast
- .gitignore does not cover .env.dev or .env.* — must be added
- appsettings.*.local.json is excluded by .gitignore (correct pattern for local overrides)
- Production credential injection mechanism is undocumented — operational gap

## OAuth / API endpoints
- OAuth: POST /oauth/accesstoken, client_credentials flow, base https://api-int.uscis.gov
- Case status: GET /case-status/{receiptNumber} (upstream USCIS API)
- Internal API: GET /api/case/{caseNumber} (our API, proxied through nginx in prod)
