using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource;
using PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource;
using PhysioBoo.Application.Queries.Sys_Resources.GetAllResources;
using PhysioBoo.Application.ViewModels.Sys_Resources;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class Sys_ResourceEnpoints
    {
        public static void MapSys_ResourceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/resources")
                .WithTags("Sys_Resource")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Import Local Resources
            group.MapPost("/import-local", async (
                [FromForm] ImportLocalResourceViewModel newResource,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                ImportLocalResourceCommand requestCmd = new ImportLocalResourceCommand(newResource.File);

                await bus.SendCommandAsync(requestCmd);

                return Results.Ok(new ResponseMessage<object>
                {
                    Success = true,
                    Data = new
                    {
                        Inserted = requestCmd.Inserted,
                        Updated = requestCmd.Updated
                    }
                });
            }).WithName("ImportLocalResources")
            .WithSummary("Import local resources")
            .Produces<ResponseMessage<object>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<object>>(StatusCodes.Status400BadRequest)
            .DisableAntiforgery();
            #endregion

            #region Import Remote Resources
            group.MapPost("/import-remote", async (
                ImportRemoteResourceViewModel newResource,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                ImportRemoteResourceCommand requestCmd = new ImportRemoteResourceCommand(newResource.Url);

                await bus.SendCommandAsync(requestCmd);

                return Results.Ok(new ResponseMessage<object>
                {
                    Success = true,
                    Data = new
                    {
                        Inserted = requestCmd.Inserted,
                        Updated = requestCmd.Updated
                    }
                });
            }).WithName("ImportRemoteResources")
            .WithSummary("Import remote resources")
            .Produces<ResponseMessage<object>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<object>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Resources
            group.MapPost("/search", async (
                [FromQuery] string code,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                string result = await bus.QueryAsync(new GetAllResourceQuery(code));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchResources")
            .WithSummary("Retrieve a list of Resources with language code.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
