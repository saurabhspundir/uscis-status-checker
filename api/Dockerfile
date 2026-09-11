# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Uscis.Shared/*.csproj Uscis.Shared/
COPY api/*.csproj api/
RUN dotnet restore api/UscisApi.csproj

FROM build AS publish
COPY Uscis.Shared/ Uscis.Shared/
COPY api/ api/
RUN dotnet publish api/UscisApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "UscisApi.dll"]
