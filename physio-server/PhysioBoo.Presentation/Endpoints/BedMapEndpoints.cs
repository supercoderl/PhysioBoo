using PhysioBoo.Application.Commands.BedMap.AssignPatient;
using PhysioBoo.Application.Commands.BedMap.CreateBed;
using PhysioBoo.Application.Commands.BedMap.CreateWard;
using PhysioBoo.Application.Commands.BedMap.DeleteBed;
using PhysioBoo.Application.Commands.BedMap.DeleteWard;
using PhysioBoo.Application.Commands.BedMap.DischargeBed;
using PhysioBoo.Application.Commands.BedMap.UpdateBed;
using PhysioBoo.Application.Commands.BedMap.UpdateWard;
using PhysioBoo.Application.Queries.BedMap.GetBedById;
using PhysioBoo.Application.Queries.BedMap.GetBedHistory;
using PhysioBoo.Application.Queries.BedMap.GetSnapshot;
using PhysioBoo.Application.Queries.BedMap.GetStats;
using PhysioBoo.Application.Queries.BedMap.GetWards;
using PhysioBoo.Application.Queries.BedMap.SearchBeds;
using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class BedMapEndpoints
    {
        public static void MapBedMapEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/bed-map")
                .WithTags("Bed Map")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Wards
            group.MapGet("/wards", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<WardViewModel> result = await bus.QueryAsync(new GetWardsQuery());

                return Results.Ok(new ResponseMessage<List<WardViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetWards")
            .WithSummary("Retrieve every ward with its bed counts.")
            .Produces<ResponseMessage<List<WardViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.BedRead);

            group.MapPost("/wards", async (
                [FromBody] CreateWardViewModel newWard,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateWardCommand(newId, newWard));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("CreateWard")
            .WithSummary("Create a ward.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.BedManage);

            group.MapPatch("/wards/{id:guid}", async (
                Guid id,
                [FromBody] UpdateWardViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateWardCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateWard")
            .WithSummary("Update a ward.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedManage);

            group.MapDelete("/wards/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteWardCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteWard")
            .WithSummary("Delete an empty ward (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedManage);
            #endregion

            #region Snapshot and Stats
            group.MapGet("/snapshot", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                BedMapSnapshotViewModel result = await bus.QueryAsync(new GetBedMapSnapshotQuery());

                return Results.Ok(new ResponseMessage<BedMapSnapshotViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetBedMapSnapshot")
            .WithSummary("Retrieve all wards and beds in one call.")
            .Produces<ResponseMessage<BedMapSnapshotViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.BedRead);

            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                BedMapStatsViewModel result = await bus.QueryAsync(new GetBedMapStatsQuery());

                return Results.Ok(new ResponseMessage<BedMapStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetBedMapStats")
            .WithSummary("Retrieve bed totals and the occupancy rate.")
            .Produces<ResponseMessage<BedMapStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.BedRead);
            #endregion

            #region Beds
            group.MapPost("/beds/search", async (
                [FromBody] PagedRequest<BedFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<BedViewModel> result = await bus.QueryAsync(new SearchBedsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<BedViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchBeds")
            .WithSummary("Retrieve a paginated list of beds with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<BedViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<BedViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.BedRead);

            group.MapPost("/beds", async (
                [FromBody] CreateBedViewModel newBed,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateBedCommand(newId, newBed));

                return Results.CreatedAtRoute(
                    "GetBedById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateBed")
            .WithSummary("Create a bed.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.BedManage);

            group.MapGet("/beds/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                BedViewModel? result = await bus.QueryAsync(new GetBedByIdQuery(id));

                return Results.Ok(new ResponseMessage<BedViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetBedById")
            .WithSummary("Retrieve a single bed.")
            .Produces<ResponseMessage<BedViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<BedViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.BedRead);

            group.MapPatch("/beds/{id:guid}", async (
                Guid id,
                [FromBody] UpdateBedViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateBedCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateBed")
            .WithSummary("Update a bed that is not occupied.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedManage);

            group.MapDelete("/beds/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteBedCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteBed")
            .WithSummary("Delete a bed that is not occupied (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedManage);
            #endregion

            #region Assign, Discharge, History
            group.MapPost("/beds/{id:guid}/assign", async (
                Guid id,
                [FromBody] AssignPatientViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AssignPatientCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("AssignPatientToBed")
            .WithSummary("Assign a patient to an available bed.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedAssign);

            group.MapPost("/beds/{id:guid}/discharge", async (
                Guid id,
                [FromBody] DischargeBedViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DischargeBedCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DischargeBed")
            .WithSummary("Discharge the patient in a bed and free it. Also discharges the linked admission.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.BedAssign);

            group.MapGet("/beds/{id:guid}/history", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<BedHistoryEntryViewModel> result = await bus.QueryAsync(new GetBedHistoryQuery(id));

                return Results.Ok(new ResponseMessage<List<BedHistoryEntryViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetBedHistory")
            .WithSummary("Retrieve the latest stays in a bed.")
            .Produces<ResponseMessage<List<BedHistoryEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.BedRead);
            #endregion
        }
    }
}
