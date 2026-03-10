using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetAll;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetById;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
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
            group.MapPost("/create", async (
                CreateSys_SequenceTrackerViewModel newSys_SequenceTracker,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateSys_SequenceTrackerCommand(newSys_SequenceTracker));

                return Results.Created($"/api/sequence-tracker/{newSys_SequenceTracker.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newSys_SequenceTracker.Id
                });
            }).WithName("CreateSys_SequenceTracker")
            .WithSummary("Create new sequence tracker")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Sequence Trackers
            group.MapPost("/search", async (
                [FromBody] PagedRequest<Sys_SequenceTrackerFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<Sys_SequenceTrackerViewModel> result = await bus.QueryAsync(new GetAllSys_SequenceTrackersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchSys_SequenceTrackers")
            .WithSummary("Retrieve a paginated list of sequence trackers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<Sys_SequenceTrackerViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Sequence Tracker
            group.MapPost("/delete", async (
                DeleteSys_SequenceTrackerViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteSys_SequenceTrackerCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Sequence tracker has been deleted successfully."
                });
            }).WithName("DeleteSys_SequenceTracker")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Sequence Tracker
            group.MapPost("/update", async (
                UpdateSys_SequenceTrackerViewModel Sys_SequenceTracker,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateSys_SequenceTrackerCommand(Sys_SequenceTracker));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = Sys_SequenceTracker.Id
                });
            }).WithName("UpdateSys_SequenceTracker")
            .WithSummary("Update sequence tracker")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Sequence Tracker By Id
            group.MapPost("/search-by-id", async (
                [FromBody] Sys_SequenceTrackerSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Sys_SequenceTrackerViewModel? result = await bus.QueryAsync(new GetSys_SequenceTrackerByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<Sys_SequenceTrackerViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchSys_SequenceTracker")
            .WithSummary("Retrieve a sequence tracker record.")
            .Produces<ResponseMessage<Sys_SequenceTrackerViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Sys_SequenceTrackerViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
