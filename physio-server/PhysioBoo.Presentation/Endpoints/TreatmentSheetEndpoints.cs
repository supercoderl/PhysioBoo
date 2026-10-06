using PhysioBoo.Application.Commands.Nursing.AcknowledgeAlert;
using PhysioBoo.Application.Commands.Nursing.ScheduleMedication;
using PhysioBoo.Application.Commands.Nursing.UpdateMedicationStatus;
using PhysioBoo.Application.Commands.TreatmentSheet.AddProcedure;
using PhysioBoo.Application.Commands.TreatmentSheet.AddProgressNote;
using PhysioBoo.Application.Commands.TreatmentSheet.CreateOrder;
using PhysioBoo.Application.Commands.TreatmentSheet.UpdateOrderStatus;
using PhysioBoo.Application.Queries.TreatmentSheet.GetAlerts;
using PhysioBoo.Application.Queries.TreatmentSheet.GetImaging;
using PhysioBoo.Application.Queries.TreatmentSheet.GetLabs;
using PhysioBoo.Application.Queries.TreatmentSheet.GetMedications;
using PhysioBoo.Application.Queries.TreatmentSheet.GetNotes;
using PhysioBoo.Application.Queries.TreatmentSheet.GetOrders;
using PhysioBoo.Application.Queries.TreatmentSheet.GetProcedures;
using PhysioBoo.Application.Queries.TreatmentSheet.GetStats;
using PhysioBoo.Application.Queries.TreatmentSheet.GetSummary;
using PhysioBoo.Application.Queries.TreatmentSheet.GetTimeline;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class TreatmentSheetEndpoints
    {
        private const int MaxPageSize = 200;

        public static void MapTreatmentSheetEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/treatment-sheet")
                .WithTags("Treatment Sheet")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Header
            group.MapGet("/patients/{patientId:guid}/summary", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                TreatmentPatientSummaryViewModel? result = await bus.QueryAsync(new GetTreatmentSummaryQuery(patientId));

                return Results.Ok(new ResponseMessage<TreatmentPatientSummaryViewModel?> { Success = true, Data = result });
            }).WithName("GetTreatmentSummary")
            .WithSummary("Header of the treatment sheet: patient, stay, bed and attending doctor.")
            .Produces<ResponseMessage<TreatmentPatientSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TreatmentPatientSummaryViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapGet("/patients/{patientId:guid}/stats", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                TreatmentStatsViewModel result = await bus.QueryAsync(new GetTreatmentStatsQuery(patientId));

                return Results.Ok(new ResponseMessage<TreatmentStatsViewModel> { Success = true, Data = result });
            }).WithName("GetTreatmentStats")
            .WithSummary("Order, medication, alert, lab and imaging counters.")
            .Produces<ResponseMessage<TreatmentStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapGet("/patients/{patientId:guid}/alerts", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<TreatmentAlertViewModel> result = await bus.QueryAsync(new GetTreatmentAlertsQuery(patientId));

                return Results.Ok(new ResponseMessage<List<TreatmentAlertViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentAlerts")
            .WithSummary("Open clinical alerts for the patient, most severe first.")
            .Produces<ResponseMessage<List<TreatmentAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapPost("/alerts/{alertId:guid}/acknowledge", async (
                Guid alertId,
                [FromBody] AcknowledgeAlertViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AcknowledgeAlertCommand(alertId, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = alertId });
            }).WithName("AcknowledgeTreatmentAlert")
            .WithSummary("Acknowledge an alert. Repeating it changes nothing.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);

            group.MapGet("/patients/{patientId:guid}/timeline", async (
                Guid patientId,
                [FromQuery] string range,
                [FromQuery(Name = "from")] DateTime? rangeStart,
                [FromQuery(Name = "to")] DateTime? rangeEnd,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<TreatmentTimelineEntryViewModel> result = await bus.QueryAsync(new GetTreatmentTimelineQuery(patientId, range, rangeStart, rangeEnd));

                return Results.Ok(new ResponseMessage<List<TreatmentTimelineEntryViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentTimeline")
            .WithSummary("Everything recorded for the patient in a window, newest first.")
            .Produces<ResponseMessage<List<TreatmentTimelineEntryViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<List<TreatmentTimelineEntryViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);
            #endregion

            #region Orders
            group.MapGet("/patients/{patientId:guid}/orders", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<TreatmentOrderViewModel> result = await bus.QueryAsync(
                    new GetTreatmentOrdersQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<TreatmentOrderViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentOrders")
            .WithSummary("Treatment orders, newest first.")
            .Produces<ResponseMessage<PagedResult<TreatmentOrderViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapPost("/patients/{patientId:guid}/orders", async (
                Guid patientId,
                [FromBody] CreateTreatmentOrderViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateTreatmentOrderCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<TreatmentOrderViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateTreatmentOrder")
            .WithSummary("Create a treatment order. The ordering doctor is the signed-in user.")
            .Produces<ResponseMessage<TreatmentOrderViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TreatmentOrderViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);

            group.MapPatch("/orders/{orderId:guid}", async (
                Guid orderId,
                [FromBody] UpdateTreatmentOrderStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateTreatmentOrderStatusCommand command = new(orderId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<TreatmentOrderViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateTreatmentOrderStatus")
            .WithSummary("Change an order's status.")
            .Produces<ResponseMessage<TreatmentOrderViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TreatmentOrderViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<TreatmentOrderViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);
            #endregion

            #region Medications
            group.MapGet("/patients/{patientId:guid}/medications", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<MedicationAdministrationViewModel> result = await bus.QueryAsync(
                    new GetTreatmentMedicationsQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<MedicationAdministrationViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentMedications")
            .WithSummary("Medication administration record, newest dose first.")
            .Produces<ResponseMessage<PagedResult<MedicationAdministrationViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapPost("/patients/{patientId:guid}/medications", async (
                Guid patientId,
                [FromBody] ScheduleMedicationViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ScheduleMedicationCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<MedicationAdministrationViewModel?>
                {
                    Success = true,
                    Data = command.Result == null ? null : MedicationAdministrationViewModel.FromEntity(command.Result)
                });
            }).WithName("ScheduleTreatmentMedication")
            .WithSummary("Schedule a medication dose for a patient.")
            .Produces<ResponseMessage<MedicationAdministrationViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicationAdministrationViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);

            group.MapPatch("/medications/{entryId:guid}", async (
                Guid entryId,
                [FromBody] UpdateMedicationStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateMedicationStatusCommand command = new(entryId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<MedicationAdministrationViewModel?>
                {
                    Success = true,
                    Data = command.Result == null ? null : MedicationAdministrationViewModel.FromEntity(command.Result)
                });
            }).WithName("UpdateTreatmentMedicationStatus")
            .WithSummary("Record a dose as given, missed, refused or held.")
            .Produces<ResponseMessage<MedicationAdministrationViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicationAdministrationViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<MedicationAdministrationViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);
            #endregion

            #region Procedures, Labs, Imaging
            group.MapGet("/patients/{patientId:guid}/procedures", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<TreatmentProcedureRowViewModel> result = await bus.QueryAsync(
                    new GetTreatmentProceduresQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<TreatmentProcedureRowViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentProcedures")
            .WithSummary("Procedures, newest first.")
            .Produces<ResponseMessage<PagedResult<TreatmentProcedureRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapPost("/patients/{patientId:guid}/procedures", async (
                Guid patientId,
                [FromBody] AddProcedureViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AddProcedureCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<TreatmentProcedureRowViewModel?> { Success = true, Data = command.Result });
            }).WithName("AddTreatmentProcedure")
            .WithSummary("Record a procedure.")
            .Produces<ResponseMessage<TreatmentProcedureRowViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TreatmentProcedureRowViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);

            group.MapGet("/patients/{patientId:guid}/labs", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<TreatmentLabOrderRowViewModel> result = await bus.QueryAsync(
                    new GetTreatmentLabsQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<TreatmentLabOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentLabs")
            .WithSummary("Laboratory tests ordered for the patient (read from the laboratory module).")
            .Produces<ResponseMessage<PagedResult<TreatmentLabOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapGet("/patients/{patientId:guid}/imaging", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<TreatmentImagingOrderRowViewModel> result = await bus.QueryAsync(
                    new GetTreatmentImagingQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<TreatmentImagingOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentImaging")
            .WithSummary("Imaging studies ordered for the patient (read from the radiology module).")
            .Produces<ResponseMessage<PagedResult<TreatmentImagingOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);
            #endregion

            #region Notes
            group.MapGet("/patients/{patientId:guid}/notes", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<TreatmentProgressNoteViewModel> result = await bus.QueryAsync(
                    new GetTreatmentNotesQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<TreatmentProgressNoteViewModel>> { Success = true, Data = result });
            }).WithName("GetTreatmentNotes")
            .WithSummary("Progress notes, newest first.")
            .Produces<ResponseMessage<PagedResult<TreatmentProgressNoteViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetRead);

            group.MapPost("/patients/{patientId:guid}/notes", async (
                Guid patientId,
                [FromBody] AddProgressNoteViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AddProgressNoteCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<TreatmentProgressNoteViewModel?> { Success = true, Data = command.Result });
            }).WithName("AddTreatmentProgressNote")
            .WithSummary("Add a progress note.")
            .Produces<ResponseMessage<TreatmentProgressNoteViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TreatmentProgressNoteViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.TreatmentSheetWrite);
            #endregion
        }
    }
}
