using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetAll;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetById;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class Sys_SequenceTrackerEndpoints
    {
        public static void MapSys_SequenceTrackerEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/sequence-trackers")
                .WithTags("Sequence Trackers")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Sequence Tracker
            group.MapPost("", async (
                [FromBody] CreateSys_SequenceTrackerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateSys_SequenceTrackerCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetSequenceTrackerById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateSequenceTracker")
            .WithSummary("Create new sequence tracker")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.SequenceTrackerCreate);
            #endregion

            #region Get All Sequence Trackers
            group.MapPost("search", async (
                [FromBody] PagedRequest<Sys_SequenceTrackerFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<Sys_SequenceTrackerViewModel> result = await bus.QueryAsync(new GetAllSys_SequenceTrackersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetSequenceTrackers")
            .WithSummary("Retrieve a paginated list of sequence trackers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.SequenceTrackerRead);
            #endregion

            #region Delete Sequence Tracker
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteSys_SequenceTrackerCommand(id));

                return Results.NoContent();
            }).WithName("DeleteSequenceTracker")
            .WithSummary("Handles requests to delete a specific sequence tracker by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.SequenceTrackerDelete);
            #endregion

            #region Update Sequence Tracker
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateSys_SequenceTrackerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateSys_SequenceTrackerCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateSequenceTracker")
            .WithSummary("Update sequence tracker")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.SequenceTrackerUpdate);
            #endregion

            #region Get Sequence Tracker By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Sys_SequenceTrackerViewModel? result = await bus.QueryAsync(new GetSys_SequenceTrackerByIdQuery(id));

                return Results.Ok(new ResponseMessage<Sys_SequenceTrackerViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetSequenceTrackerById")
            .WithSummary("Retrieve a sequence tracker record.")
            .Produces<ResponseMessage<Sys_SequenceTrackerViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Sys_SequenceTrackerViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.SequenceTrackerRead);
            #endregion
        }
    }
}
