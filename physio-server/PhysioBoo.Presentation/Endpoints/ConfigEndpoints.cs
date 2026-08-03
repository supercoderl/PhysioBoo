using PhysioBoo.Application.Queries.Configurations.GetInitData;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ConfigEndpoints
    {
        public static void MapConfigEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/config")
                .WithTags("Configuration")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Get configuration data
            group.MapGet("", async (
                HttpRequest request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InitDataViewModel result = await bus.QueryAsync(new GetInitDataQuery());

                return Results.Ok(new ResponseMessage<InitDataViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetConfiguration")
            .WithSummary("Get all data for first configuration")
            .Produces<ResponseMessage<InitDataViewModel>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InitDataViewModel>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.System.ConfigRead);
            #endregion

            #region Get version
            group.MapGet("/version", (
                HttpContext context,
                IConfiguration configuration
            ) =>
            {
                string version = configuration["AppConfig:Version"] ?? "1.0.0";
                string etag = $"\"{version}\"";

                if (context.Request.Headers.TryGetValue("If-None-Match", out Microsoft.Extensions.Primitives.StringValues inm))
                {
                    if (inm.ToString() == etag)
                    {
                        context.Response.Headers["ETag"] = etag;
                        return Results.StatusCode(StatusCodes.Status304NotModified);
                    }
                }

                context.Response.Headers["ETag"] = etag;

                return Results.Ok(version);
            }).WithName("GetConfigurationVersion")
            .WithSummary("Return app configuration version")
            .Produces<string>(StatusCodes.Status200OK)
            .Produces<string>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
