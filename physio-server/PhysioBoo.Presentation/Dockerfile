# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["PhysioBoo.Presentation/PhysioBoo.Presentation.csproj", "PhysioBoo.Presentation/"]
COPY ["PhysioBoo.Application/PhysioBoo.Application.csproj", "PhysioBoo.Application/"]
COPY ["PhysioBoo.Domain/PhysioBoo.Domain.csproj", "PhysioBoo.Domain/"]
COPY ["PhysioBoo.SharedKenel/PhysioBoo.SharedKernel.csproj", "PhysioBoo.SharedKenel/"]
COPY ["PhysioBoo.Shared/PhysioBoo.Shared.csproj", "PhysioBoo.Shared/"]
COPY ["PhysioBoo.Proto/PhysioBoo.Proto.csproj", "PhysioBoo.Proto/"]
COPY ["PhysioBoo.Infrastructure/PhysioBoo.Infrastructure.csproj", "PhysioBoo.Infrastructure/"]
COPY ["PhysioBoo.ServiceDefaults/PhysioBoo.ServiceDefaults.csproj", "PhysioBoo.ServiceDefaults/"]
RUN dotnet restore "./PhysioBoo.Presentation/PhysioBoo.Presentation.csproj"
COPY . .
WORKDIR "/src/PhysioBoo.Presentation"
RUN dotnet build "./PhysioBoo.Presentation.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./PhysioBoo.Presentation.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PhysioBoo.Presentation.dll"]