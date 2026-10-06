using PhysioBoo.Application.Commands.Surgeries.AcknowledgeAlert;
using PhysioBoo.Application.Commands.Surgeries.AdvanceStage;
using PhysioBoo.Application.Commands.Surgeries.AssignTeamMember;
using PhysioBoo.Application.Commands.Surgeries.CancelSurgery;
using PhysioBoo.Application.Commands.Surgeries.CreateRoom;
using PhysioBoo.Application.Commands.Surgeries.CreateSurgery;
using PhysioBoo.Application.Commands.Surgeries.DischargeSurgery;
using PhysioBoo.Application.Commands.Surgeries.UpdateChecklistItem;
using PhysioBoo.Application.Commands.Surgeries.UpdateEquipmentItem;
using PhysioBoo.Application.Commands.Surgeries.UpdateIntraOp;
using PhysioBoo.Application.Commands.Surgeries.UpdatePostOp;
using PhysioBoo.Application.Commands.Surgeries.UpdateRoomStatus;
using PhysioBoo.Application.Queries.Surgeries.GetAlerts;
using PhysioBoo.Application.Queries.Surgeries.GetCaseDetail;
using PhysioBoo.Application.Queries.Surgeries.GetPatientSummary;
using PhysioBoo.Application.Queries.Surgeries.GetRooms;
using PhysioBoo.Application.Queries.Surgeries.GetStats;
using PhysioBoo.Application.Queries.Surgeries.GetTrends;
using PhysioBoo.Application.Queries.Surgeries.SearchCases;
using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class SurgeryEndpoints
    {
        // The schedule screens filter on the client, so one request must be able to carry a whole day or week.
        private const int DefaultPageSize = 200;

        public static void MapSurgeryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/surgery")
                .WithTags("Surgery")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Stats
            group.MapGet("/stats", async ([FromQuery] string? range, IMediatorHandler bus, CancellationToken ct) =>
            {
                SurgeryStatsViewModel result = await bus.QueryAsync(new GetSurgeryStatsQuery(range));

                return Results.Ok(new ResponseMessage<SurgeryStatsViewModel> { Success = true, Data = result });
            }).WithName("GetSurgeryStats")
            .WithSummary("Dashboard counters for a range: today (default), week or month.")
            .Produces<ResponseMessage<SurgeryStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);
            #endregion

            #region Trends
            group.MapGet("/trends", async ([FromQuery] string? range, IMediatorHandler bus, CancellationToken ct) =>
            {
                SurgeryTrendViewModel result = await bus.QueryAsync(new GetSurgeryTrendsQuery(range));

                return Results.Ok(new ResponseMessage<SurgeryTrendViewModel> { Success = true, Data = result });
            }).WithName("GetSurgeryTrends")
            .WithSummary("Chart series for a range: week (default), today or month.")
            .Produces<ResponseMessage<SurgeryTrendViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);
            #endregion

            #region Alerts
            group.MapGet("/alerts", async (IMediatorHandler bus, CancellationToken ct) =>
            {
                List<SurgeryAlertViewModel> result = await bus.QueryAsync(new GetSurgeryAlertsQuery());

                return Results.Ok(new ResponseMessage<List<SurgeryAlertViewModel>> { Success = true, Data = result });
            }).WithName("GetSurgeryAlerts")
            .WithSummary("Critical alerts that have not been acknowledged yet.")
            .Produces<ResponseMessage<List<SurgeryAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);

            group.MapPost("/alerts/{alertId:guid}/acknowledge", async (
                Guid alertId,
                [FromBody] AcknowledgeSurgeryAlertViewModel? request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AcknowledgeSurgeryAlertCommand(alertId, request ?? new AcknowledgeSurgeryAlertViewModel(null)));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = alertId });
            }).WithName("AcknowledgeSurgeryAlert")
            .WithSummary("Acknowledge an alert. Acknowledging twice is not an error.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);
            #endregion

            #region Search Cases
            group.MapGet("/cases/search", async (
                [FromQuery] string? search,
                [FromQuery] string? operatingRoom,
                [FromQuery] string? department,
                [FromQuery] string? surgeon,
                [FromQuery] string? status,
                [FromQuery] string? priority,
                [FromQuery] bool? emergencyOnly,
                [FromQuery] DateTime? dateFrom,
                [FromQuery] DateTime? dateTo,
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<SurgeryRowViewModel> result = await bus.QueryAsync(new SearchSurgeriesQuery(
                    search, operatingRoom, department, surgeon, status, priority, emergencyOnly, dateFrom, dateTo,
                    pageNumber is > 0 ? pageNumber.Value : 1,
                    pageSize is > 0 ? pageSize.Value : DefaultPageSize
                ));

                return Results.Ok(new ResponseMessage<PagedResult<SurgeryRowViewModel>> { Success = true, Data = result });
            }).WithName("SearchSurgeryCases")
            .WithSummary("Retrieve surgery cases ordered by scheduled start; every filter is optional.")
            .Produces<ResponseMessage<PagedResult<SurgeryRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);
            #endregion

            #region Create Case
            group.MapPost("/cases", async (
                [FromBody] CreateSurgeryViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                CreateSurgeryCommand command = new(newId, request);

                await bus.SendCommandAsync(command);

                return Results.CreatedAtRoute(
                    "GetSurgeryCase",
                    new { id = newId },
                    new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result }
                );
            }).WithName("CreateSurgeryCase")
            .WithSummary("Schedule a surgery: books the room, adds the standard pre-op checklist and raises consent and allergy alerts.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Surgery.SurgerySchedule);
            #endregion

            #region Get Case
            group.MapGet("/cases/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                SurgeryCaseViewModel? result = await bus.QueryAsync(new GetSurgeryCaseQuery(id));

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = result });
            }).WithName("GetSurgeryCase")
            .WithSummary("Retrieve one surgery case with its team, equipment, checklist and timeline.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);
            #endregion

            #region Cancel Case
            group.MapPost("/cases/{id:guid}/cancel", async (
                Guid id,
                [FromBody] CancelSurgeryViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CancelSurgeryCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result });
            }).WithName("CancelSurgeryCase")
            .WithSummary("Cancel a case that has not gone to theatre yet.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgerySchedule);
            #endregion

            #region Rooms
            group.MapGet("/rooms", async (IMediatorHandler bus, CancellationToken ct) =>
            {
                List<OperatingRoomViewModel> result = await bus.QueryAsync(new GetOperatingRoomsQuery());

                return Results.Ok(new ResponseMessage<List<OperatingRoomViewModel>> { Success = true, Data = result });
            }).WithName("GetOperatingRooms")
            .WithSummary("Operating rooms with the case currently using each one.")
            .Produces<ResponseMessage<List<OperatingRoomViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);

            group.MapPost("/rooms", async (
                [FromBody] CreateOperatingRoomViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateOperatingRoomCommand command = new(Guid.NewGuid(), request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<OperatingRoomViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateOperatingRoom")
            .WithSummary("Add an operating room.")
            .Produces<ResponseMessage<OperatingRoomViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<OperatingRoomViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Surgery.RoomManage);

            group.MapPatch("/rooms/{roomId:guid}/status", async (
                Guid roomId,
                [FromBody] UpdateRoomStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateRoomStatusCommand(roomId, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = roomId });
            }).WithName("UpdateOperatingRoomStatus")
            .WithSummary("Change the status of an operating room. A room with an operation in progress cannot be freed.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.RoomManage);
            #endregion

            #region Checklist, Team and Equipment
            group.MapPatch("/cases/{id:guid}/checklist/{itemId:guid}", async (
                Guid id,
                Guid itemId,
                [FromBody] UpdateChecklistItemViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateChecklistItemCommand command = new(id, itemId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<PreOpChecklistItemViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateSurgeryChecklistItem")
            .WithSummary("Tick or untick a pre-operative checklist item; the signed-in user is recorded as the signer.")
            .Produces<ResponseMessage<PreOpChecklistItemViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PreOpChecklistItemViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<PreOpChecklistItemViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);

            group.MapPatch("/cases/{id:guid}/team/{memberId:guid}", async (
                Guid id,
                Guid memberId,
                [FromBody] AssignTeamMemberViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AssignTeamMemberCommand command = new(id, memberId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgicalTeamMemberViewModel?> { Success = true, Data = command.Result });
            }).WithName("AssignSurgeryTeamMember")
            .WithSummary("Replace the staff member or role of a team slot.")
            .Produces<ResponseMessage<SurgicalTeamMemberViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgicalTeamMemberViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgicalTeamMemberViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);

            group.MapPatch("/cases/{id:guid}/equipment/{itemId:guid}", async (
                Guid id,
                Guid itemId,
                [FromBody] UpdateEquipmentItemViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateEquipmentItemCommand command = new(id, itemId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryEquipmentItemViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateSurgeryEquipmentItem")
            .WithSummary("Change the status or quantity of an equipment item. Marking it Missing raises an alert.")
            .Produces<ResponseMessage<SurgeryEquipmentItemViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryEquipmentItemViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryEquipmentItemViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);
            #endregion

            #region Stages, Intra-op, Post-op and Discharge
            group.MapPost("/cases/{id:guid}/timeline/{stage}", async (
                Guid id,
                string stage,
                [FromBody] AdvanceStageViewModel? request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AdvanceStageCommand command = new(id, stage, request ?? new AdvanceStageViewModel(null));

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result });
            }).WithName("AdvanceSurgeryStage")
            .WithSummary("Record that a case reached a stage. Stages only move forward.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);

            group.MapPatch("/cases/{id:guid}/intraop", async (
                Guid id,
                [FromBody] UpdateIntraOpViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateIntraOpCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateSurgeryIntraOp")
            .WithSummary("Record intra-operative notes, complications and blood loss; fields that are left out keep their value.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);

            group.MapPatch("/cases/{id:guid}/postop", async (
                Guid id,
                [FromBody] UpdatePostOpViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdatePostOpCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateSurgeryPostOp")
            .WithSummary("Record recovery details and follow-up orders; fields that are left out keep their value.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);

            group.MapPost("/cases/{id:guid}/discharge", async (
                Guid id,
                [FromBody] AdvanceStageViewModel? request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                DischargeSurgeryCommand command = new(id, request ?? new AdvanceStageViewModel(null));

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<SurgeryCaseViewModel?> { Success = true, Data = command.Result });
            }).WithName("DischargeSurgeryCase")
            .WithSummary("Discharge the patient from theatre once the procedure is completed or the patient is in recovery.")
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<SurgeryCaseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryUpdate);
            #endregion

            #region Patient Summary
            group.MapGet("/patients/{patientId:guid}/summary", async (Guid patientId, IMediatorHandler bus, CancellationToken ct) =>
            {
                SurgeryPatientSummaryViewModel? result = await bus.QueryAsync(new GetSurgeryPatientSummaryQuery(patientId));

                return Results.Ok(new ResponseMessage<SurgeryPatientSummaryViewModel?> { Success = true, Data = result });
            }).WithName("GetSurgeryPatientSummary")
            .WithSummary("Allergies, history and recent surgeries of a patient, for the case drawer.")
            .Produces<ResponseMessage<SurgeryPatientSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SurgeryPatientSummaryViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Surgery.SurgeryRead);
            #endregion
        }
    }
}
