using MediatR;
using PhysioBoo.Application.Queries.Configurations.GetInitData;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ConfigEndpoints
    {
        public static void MapConfigEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api")
                .WithTags("Configuration")
                .WithOpenApi();

            #region Get configuration data
            group.MapPost("/config", async (
                HttpRequest request,
                INotificationHandler<DomainNotification> handler,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                InitDataViewModel result = await bus.QueryAsync(new GetInitDataQuery());

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

                return Results.Ok(new ResponseMessage<InitDataViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetConfiguration")
            .WithSummary("Get all data for first configuration")
            .Produces<ResponseMessage<InitDataViewModel>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InitDataViewModel>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get version
            group.MapPost("/config/version", (
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
