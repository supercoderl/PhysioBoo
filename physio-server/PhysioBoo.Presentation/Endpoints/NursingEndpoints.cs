using PhysioBoo.Application.Commands.Nursing.UpdateHandover;
using PhysioBoo.Application.Commands.Nursing.AcknowledgeAlert;
using PhysioBoo.Application.Commands.Nursing.AcknowledgeHandover;
using PhysioBoo.Application.Commands.Nursing.AddIntakeOutput;
using PhysioBoo.Application.Commands.Nursing.AddNursingNote;
using PhysioBoo.Application.Commands.Nursing.AddVitals;
using PhysioBoo.Application.Commands.Nursing.CreateAssignment;
using PhysioBoo.Application.Commands.Nursing.CreateTask;
using PhysioBoo.Application.Commands.Nursing.DeleteAssignment;
using PhysioBoo.Application.Commands.Nursing.GenerateHandover;
using PhysioBoo.Application.Commands.Nursing.ScheduleMedication;
using PhysioBoo.Application.Commands.Nursing.UpdateMedicationStatus;
using PhysioBoo.Application.Commands.Nursing.UpdateTaskStatus;
using PhysioBoo.Application.Queries.Nursing.GetAlerts;
using PhysioBoo.Application.Queries.Nursing.GetAssignments;
using PhysioBoo.Application.Queries.Nursing.GetHandover;
using PhysioBoo.Application.Queries.Nursing.GetIntakeOutput;
using PhysioBoo.Application.Queries.Nursing.GetMar;
using PhysioBoo.Application.Queries.Nursing.GetNotes;
using PhysioBoo.Application.Queries.Nursing.GetPatient;
using PhysioBoo.Application.Queries.Nursing.GetStats;
using PhysioBoo.Application.Queries.Nursing.GetTasks;
using PhysioBoo.Application.Queries.Nursing.GetVitals;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class NursingEndpoints
    {
        private const int MaxPageSize = 200;

        public static void MapNursingEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/nursing")
                .WithTags("Nursing")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Dashboard
            group.MapGet("/assignments", async (
                [FromQuery] ShiftCode shift,
                [FromQuery] Guid? wardId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<NursingPatientViewModel> result = await bus.QueryAsync(new GetNursingAssignmentsQuery(shift, wardId));

                return Results.Ok(new ResponseMessage<List<NursingPatientViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingAssignments")
            .WithSummary("The signed-in nurse's patients for a shift, sickest first.")
            .Produces<ResponseMessage<List<NursingPatientViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapGet("/stats", async (
                [FromQuery] ShiftCode shift,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                NursingStatsViewModel result = await bus.QueryAsync(new GetNursingStatsQuery(shift));

                return Results.Ok(new ResponseMessage<NursingStatsViewModel> { Success = true, Data = result });
            }).WithName("GetNursingStats")
            .WithSummary("Dashboard counters for the nurse's shift.")
            .Produces<ResponseMessage<NursingStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapGet("/alerts", async (
                [FromQuery] ShiftCode shift,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<NursingAlertViewModel> result = await bus.QueryAsync(new GetNursingAlertsQuery(shift));

                return Results.Ok(new ResponseMessage<List<NursingAlertViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingAlerts")
            .WithSummary("Open alerts for the nurse's patients, most severe first.")
            .Produces<ResponseMessage<List<NursingAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/alerts/{alertId:guid}/acknowledge", async (
                Guid alertId,
                [FromBody] AcknowledgeAlertViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AcknowledgeAlertCommand(alertId, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = alertId });
            }).WithName("AcknowledgeNursingAlert")
            .WithSummary("Acknowledge an alert. Repeating it changes nothing.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);
            #endregion

            #region Assignments (management)
            group.MapPost("/assignments", async (
                [FromBody] CreateNursingAssignmentViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateNursingAssignmentCommand command = new(request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<Guid?> { Success = true, Data = command.ResultId });
            }).WithName("CreateNursingAssignment")
            .WithSummary("Assign an admitted patient to a nurse for a shift (or update that assignment).")
            .Produces<ResponseMessage<Guid?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingManage);

            group.MapDelete("/assignments/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteNursingAssignmentCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteNursingAssignment")
            .WithSummary("Remove a nursing assignment (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingManage);
            #endregion

            #region Patient chart
            group.MapGet("/patients/{patientId:guid}", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                NursingPatientViewModel? result = await bus.QueryAsync(new GetNursingPatientQuery(patientId));

                return Results.Ok(new ResponseMessage<NursingPatientViewModel?> { Success = true, Data = result });
            }).WithName("GetNursingPatient")
            .WithSummary("Nursing context of an admitted patient.")
            .Produces<ResponseMessage<NursingPatientViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NursingPatientViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapGet("/patients/{patientId:guid}/vitals", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<VitalsReadingViewModel> result = await bus.QueryAsync(
                    new GetVitalsQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<VitalsReadingViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingVitals")
            .WithSummary("Vital signs history, newest first.")
            .Produces<ResponseMessage<PagedResult<VitalsReadingViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/patients/{patientId:guid}/vitals", async (
                Guid patientId,
                [FromBody] AddVitalsViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AddVitalsCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<VitalsReadingViewModel?> { Success = true, Data = command.Result });
            }).WithName("AddNursingVitals")
            .WithSummary("Record a vital signs reading. Abnormal values raise an alert.")
            .Produces<ResponseMessage<VitalsReadingViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<VitalsReadingViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);

            group.MapGet("/patients/{patientId:guid}/mar", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<MarEntryViewModel> result = await bus.QueryAsync(
                    new GetMarQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<MarEntryViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingMar")
            .WithSummary("Medication administration record, newest dose first.")
            .Produces<ResponseMessage<PagedResult<MarEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/patients/{patientId:guid}/mar", async (
                Guid patientId,
                [FromBody] ScheduleMedicationViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ScheduleMedicationCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<MarEntryViewModel?>
                {
                    Success = true,
                    Data = command.Result == null ? null : MarEntryViewModel.FromEntity(command.Result)
                });
            }).WithName("ScheduleNursingMedication")
            .WithSummary("Schedule a medication dose for a patient.")
            .Produces<ResponseMessage<MarEntryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MarEntryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingManage);

            group.MapPatch("/mar/{marEntryId:guid}", async (
                Guid marEntryId,
                [FromBody] UpdateMedicationStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateMedicationStatusCommand command = new(marEntryId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<MarEntryViewModel?>
                {
                    Success = true,
                    Data = command.Result == null ? null : MarEntryViewModel.FromEntity(command.Result)
                });
            }).WithName("UpdateNursingMarStatus")
            .WithSummary("Record a dose as given, missed or held.")
            .Produces<ResponseMessage<MarEntryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MarEntryViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<MarEntryViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);

            group.MapGet("/patients/{patientId:guid}/io", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<IntakeOutputEntryViewModel> result = await bus.QueryAsync(
                    new GetIntakeOutputQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<IntakeOutputEntryViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingIntakeOutput")
            .WithSummary("Fluid intake and output log, newest first.")
            .Produces<ResponseMessage<PagedResult<IntakeOutputEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/patients/{patientId:guid}/io", async (
                Guid patientId,
                [FromBody] AddIntakeOutputViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AddIntakeOutputCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<IntakeOutputEntryViewModel?> { Success = true, Data = command.Result });
            }).WithName("AddNursingIntakeOutput")
            .WithSummary("Record a fluid intake or output entry.")
            .Produces<ResponseMessage<IntakeOutputEntryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<IntakeOutputEntryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);

            group.MapGet("/patients/{patientId:guid}/tasks", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<NursingTaskViewModel> result = await bus.QueryAsync(
                    new GetNursingTasksQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<NursingTaskViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingTasks")
            .WithSummary("A patient's nursing tasks, by due time.")
            .Produces<ResponseMessage<PagedResult<NursingTaskViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/patients/{patientId:guid}/tasks", async (
                Guid patientId,
                [FromBody] CreateNursingTaskViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateNursingTaskCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<NursingTaskViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateNursingTask")
            .WithSummary("Create a nursing task for a patient.")
            .Produces<ResponseMessage<NursingTaskViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NursingTaskViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingManage);

            group.MapPatch("/tasks/{taskId:guid}", async (
                Guid taskId,
                [FromBody] UpdateTaskStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateTaskStatusCommand command = new(taskId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<NursingTaskViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateNursingTaskStatus")
            .WithSummary("Complete or cancel a pending task.")
            .Produces<ResponseMessage<NursingTaskViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NursingTaskViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<NursingTaskViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);

            group.MapGet("/patients/{patientId:guid}/notes", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 50
            ) =>
            {
                PagedResult<NursingNoteViewModel> result = await bus.QueryAsync(
                    new GetNursingNotesQuery(patientId, Math.Max(pageNumber, 1), Math.Clamp(pageSize, 1, MaxPageSize)));

                return Results.Ok(new ResponseMessage<PagedResult<NursingNoteViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingNotes")
            .WithSummary("The patient's clinical notes (doctor, nursing, consultation), newest first.")
            .Produces<ResponseMessage<PagedResult<NursingNoteViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPost("/patients/{patientId:guid}/notes", async (
                Guid patientId,
                [FromBody] AddNursingNoteViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AddNursingNoteCommand command = new(patientId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<NursingNoteViewModel?> { Success = true, Data = command.Result });
            }).WithName("AddNursingNote")
            .WithSummary("Add a nursing note.")
            .Produces<ResponseMessage<NursingNoteViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NursingNoteViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);
            #endregion

            #region Handover
            group.MapGet("/handover", async (
                [FromQuery] ShiftCode outgoingShift,
                [FromQuery] Guid? wardId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                // Create the cards of this shift that do not exist yet, then read them.
                await bus.SendCommandAsync(new GenerateHandoverCommand(outgoingShift));
                List<ShiftHandoverCardViewModel> result = await bus.QueryAsync(new GetHandoverCardsQuery(outgoingShift, wardId));

                return Results.Ok(new ResponseMessage<List<ShiftHandoverCardViewModel>> { Success = true, Data = result });
            }).WithName("GetNursingHandover")
            .WithSummary("SBAR handover cards of the outgoing shift, generated from recorded data.")
            .Produces<ResponseMessage<List<ShiftHandoverCardViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Inpatient.NursingRead);

            group.MapPatch("/handover/{cardId:guid}", async (
                Guid cardId,
                [FromBody] UpdateHandoverViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateHandoverCommand command = new(cardId, request);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ShiftHandoverCardViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateNursingHandover")
            .WithSummary("Edit a handover card's SBAR text before it is acknowledged.")
            .Produces<ResponseMessage<ShiftHandoverCardViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ShiftHandoverCardViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);

            group.MapPost("/handover/{cardId:guid}/acknowledge", async (
                Guid cardId,
                [FromBody] AcknowledgeHandoverViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AcknowledgeHandoverCommand command = new(cardId);
                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ShiftHandoverCardViewModel?> { Success = true, Data = command.Result });
            }).WithName("AcknowledgeNursingHandover")
            .WithSummary("Acknowledge a handover card as the signed-in nurse.")
            .Produces<ResponseMessage<ShiftHandoverCardViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ShiftHandoverCardViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.NursingWrite);
            #endregion
        }
    }
}
