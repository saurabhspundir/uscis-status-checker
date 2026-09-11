# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Uscis.Shared/*.csproj Uscis.Shared/
COPY poller/*.csproj poller/
RUN dotnet restore poller/UscisApiPoller.csproj

FROM build AS publish
COPY Uscis.Shared/ Uscis.Shared/
COPY poller/ poller/
RUN dotnet publish poller/UscisApiPoller.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UscisApiPoller.dll"]
