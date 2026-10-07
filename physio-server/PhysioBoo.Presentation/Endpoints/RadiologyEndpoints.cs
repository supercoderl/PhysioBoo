using PhysioBoo.Application.Commands.Radiology.PlaceImagingOrder;
using PhysioBoo.Application.Commands.Radiology.AcknowledgeRadiologyAlert;
using PhysioBoo.Application.Commands.Radiology.AdvanceRadiologyQueue;
using PhysioBoo.Application.Commands.Radiology.ApproveRadiologyReport;
using PhysioBoo.Application.Commands.Radiology.CancelImagingSlot;
using PhysioBoo.Application.Commands.Radiology.ReassignImagingTechnician;
using PhysioBoo.Application.Commands.Radiology.RejectRadiologyReport;
using PhysioBoo.Application.Commands.Radiology.RescheduleImagingSlot;
using PhysioBoo.Application.Commands.Radiology.ReturnRadiologyReportForRevision;
using PhysioBoo.Application.Commands.Radiology.SaveRadiologyReport;
using PhysioBoo.Application.Queries.Radiology;
using PhysioBoo.Application.Queries.Radiology.GetAlerts;
using PhysioBoo.Application.Queries.Radiology.GetOrders;
using PhysioBoo.Application.Queries.Radiology.GetPatientHistory;
using PhysioBoo.Application.Queries.Radiology.GetPatientSummary;
using PhysioBoo.Application.Queries.Radiology.GetQueue;
using PhysioBoo.Application.Queries.Radiology.GetReport;
using PhysioBoo.Application.Queries.Radiology.GetReportTemplates;
using PhysioBoo.Application.Queries.Radiology.GetSchedule;
using PhysioBoo.Application.Queries.Radiology.GetStats;
using PhysioBoo.Application.Queries.Radiology.GetStudies;
using PhysioBoo.Application.Queries.Radiology.GetStudyById;
using PhysioBoo.Application.Queries.Radiology.GetTrends;
using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Radiology workspace (paraclinical/radiology): orders, scheduling, modality queue, studies, reporting and alerts.
    /// One imaging order is also its schedule slot, queue entry and study, so all of them use the order id.
    /// </summary>
    public static class RadiologyEndpoints
    {
        public static void MapRadiologyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/radiology")
                .WithTags("Radiology")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Dashboard
            group.MapGet("/stats", async (IMediatorHandler bus) =>
            {
                RadiologyStatsViewModel result = await bus.QueryAsync(new GetRadiologyStatsQuery());
                return Results.Ok(new ResponseMessage<RadiologyStatsViewModel> { Success = true, Data = result });
            }).WithName("GetRadiologyStats")
            .WithSummary("KPI totals for the radiology workspace.")
            .Produces<ResponseMessage<RadiologyStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapGet("/trends", async (IMediatorHandler bus) =>
            {
                RadiologyDashboardTrendViewModel result = await bus.QueryAsync(new GetRadiologyTrendsQuery());
                return Results.Ok(new ResponseMessage<RadiologyDashboardTrendViewModel> { Success = true, Data = result });
            }).WithName("GetRadiologyTrends")
            .WithSummary("Charts for the radiology dashboard tab.")
            .Produces<ResponseMessage<RadiologyDashboardTrendViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);
            #endregion

            #region Alerts
            group.MapGet("/alerts", async (IMediatorHandler bus) =>
            {
                List<CriticalFindingAlertViewModel> result = await bus.QueryAsync(new GetRadiologyAlertsQuery());
                return Results.Ok(new ResponseMessage<List<CriticalFindingAlertViewModel>> { Success = true, Data = result });
            }).WithName("GetRadiologyAlerts")
            .WithSummary("Open radiology alerts, plus those acknowledged in the last 24 hours.")
            .Produces<ResponseMessage<List<CriticalFindingAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapPost("/alerts/{id:guid}/acknowledge", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new AcknowledgeRadiologyAlertCommand(id));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("AcknowledgeRadiologyAlert")
            .WithSummary("Acknowledge an alert (confirms the ordering clinician was notified).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.AlertAcknowledge);
            #endregion

            #region Orders
            group.MapGet("/orders/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<ImagingOrderRowViewModel> result = await bus.QueryAsync(new GetImagingOrdersQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<ImagingOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("SearchRadiologyOrders")
            .WithSummary("Imaging orders with workflow and report status, newest first.")
            .Produces<ResponseMessage<PagedResult<ImagingOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);
            #endregion

            group.MapPost("/orders", async ([FromBody] PlaceImagingOrderViewModel body, IMediatorHandler bus) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new PlaceImagingOrderCommand(newId, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = newId });
            }).WithName("PlaceRadiologyOrder")
            .WithSummary("Order an imaging exam for a patient; the order joins the patient's latest visit and gets a RAD- number.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderCreate);

            #region Scheduling
            group.MapGet("/schedule/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<ScheduleSlotViewModel> result = await bus.QueryAsync(new GetScheduleSlotsQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<ScheduleSlotViewModel>> { Success = true, Data = result });
            }).WithName("SearchRadiologySchedule")
            .WithSummary("Booked exams from today onwards that have not been imaged yet.")
            .Produces<ResponseMessage<PagedResult<ScheduleSlotViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapPatch("/schedule/{id:guid}/reschedule", async (Guid id, [FromBody] RescheduleSlotViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RescheduleImagingSlotCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RescheduleRadiologySlot")
            .WithSummary("Book or move an exam (time and room). Unscheduled orders become Scheduled.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ScheduleManage);

            group.MapPost("/schedule/{id:guid}/cancel", async (Guid id, [FromBody] RadiologyReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new CancelImagingSlotCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("CancelRadiologySlot")
            .WithSummary("Cancel a booked exam.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ScheduleManage);

            group.MapPatch("/schedule/{id:guid}/reassign", async (Guid id, [FromBody] ReassignTechnicianViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ReassignImagingTechnicianCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("ReassignRadiologyTechnician")
            .WithSummary("Assign the exam to a different technician.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ScheduleManage);
            #endregion

            #region Queue
            group.MapGet("/queue", async (IMediatorHandler bus) =>
            {
                List<QueueEntryViewModel> result = await bus.QueryAsync(new GetRadiologyQueueQuery());
                return Results.Ok(new ResponseMessage<List<QueueEntryViewModel>> { Success = true, Data = result });
            }).WithName("GetRadiologyQueue")
            .WithSummary("Today's modality queue, Stat first.")
            .Produces<ResponseMessage<List<QueueEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapPatch("/queue/{id:guid}/advance", async (Guid id, [FromBody] AdvanceQueueViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new AdvanceRadiologyQueueCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("AdvanceRadiologyQueue")
            .WithSummary("Move a queue entry (Called, InProgress, Completed, Cancelled). The order status follows.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.QueueManage);
            #endregion

            #region Studies
            group.MapGet("/studies/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<StudyRecordViewModel> result = await bus.QueryAsync(new GetStudiesQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<StudyRecordViewModel>> { Success = true, Data = result });
            }).WithName("SearchRadiologyStudies")
            .WithSummary("Acquired studies with their timeline and comparison studies.")
            .Produces<ResponseMessage<PagedResult<StudyRecordViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapGet("/studies/{id:guid}", async (Guid id, IMediatorHandler bus) =>
            {
                StudyRecordViewModel? result = await bus.QueryAsync(new GetStudyByIdQuery(id));
                return Results.Ok(new ResponseMessage<StudyRecordViewModel?> { Success = true, Data = result });
            }).WithName("GetRadiologyStudy")
            .WithSummary("A single study.")
            .Produces<ResponseMessage<StudyRecordViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);
            #endregion

            #region Reporting
            group.MapGet("/report-templates", async (IMediatorHandler bus) =>
            {
                List<RadiologyReportTemplateViewModel> result = await bus.QueryAsync(new GetRadiologyReportTemplatesQuery());
                return Results.Ok(new ResponseMessage<List<RadiologyReportTemplateViewModel>> { Success = true, Data = result });
            }).WithName("GetRadiologyReportTemplates")
            .WithSummary("Built-in structured report templates.")
            .Produces<ResponseMessage<List<RadiologyReportTemplateViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingReportRead);

            group.MapGet("/reports/{orderId:guid}", async (Guid orderId, IMediatorHandler bus) =>
            {
                RadiologyReportViewModel? result = await bus.QueryAsync(new GetRadiologyReportQuery(orderId));
                return Results.Ok(new ResponseMessage<RadiologyReportViewModel?> { Success = true, Data = result });
            }).WithName("GetRadiologyReport")
            .WithSummary("The order's report, or an empty draft when none was saved yet.")
            .Produces<ResponseMessage<RadiologyReportViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingReportRead);

            group.MapPatch("/reports/{orderId:guid}", async (Guid orderId, [FromBody] SaveRadiologyReportViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new SaveRadiologyReportCommand(orderId, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = orderId });
            }).WithName("SaveRadiologyReport")
            .WithSummary("Save the report draft (created on first save). With findings and impression it goes to verification.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ReportWrite);

            group.MapPost("/reports/{orderId:guid}/approve", async (Guid orderId, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ApproveRadiologyReportCommand(orderId));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = orderId });
            }).WithName("ApproveRadiologyReport")
            .WithSummary("Verify and release the report. A critical report raises a critical-finding alert.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ReportVerify);

            group.MapPost("/reports/{orderId:guid}/reject", async (Guid orderId, [FromBody] RadiologyReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RejectRadiologyReportCommand(orderId, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = orderId });
            }).WithName("RejectRadiologyReport")
            .WithSummary("Reject the report during verification.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ReportVerify);

            group.MapPost("/reports/{orderId:guid}/return-for-revision", async (Guid orderId, [FromBody] RadiologyReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ReturnRadiologyReportForRevisionCommand(orderId, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = orderId });
            }).WithName("ReturnRadiologyReportForRevision")
            .WithSummary("Send the report back to the reporting radiologist.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ReportVerify);
            #endregion

            #region Patient
            group.MapGet("/patients/{patientKey}/summary", async (string patientKey, IMediatorHandler bus) =>
            {
                RadiologyPatientStudySummaryViewModel? result = await bus.QueryAsync(new GetRadiologyPatientSummaryQuery(patientKey));
                return Results.Ok(new ResponseMessage<RadiologyPatientStudySummaryViewModel?> { Success = true, Data = result });
            }).WithName("GetRadiologyPatientSummary")
            .WithSummary("Patient header for the study drawer. Accepts a patient id or medical record number.")
            .Produces<ResponseMessage<RadiologyPatientStudySummaryViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);

            group.MapGet("/patients/{patientKey}/history", async (string patientKey, IMediatorHandler bus) =>
            {
                PagedResult<ImagingOrderRowViewModel> result = await bus.QueryAsync(new GetRadiologyPatientHistoryQuery(patientKey));
                return Results.Ok(new ResponseMessage<PagedResult<ImagingOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("GetRadiologyPatientHistory")
            .WithSummary("A patient's imaging orders, newest first. Accepts a patient id or medical record number.")
            .Produces<ResponseMessage<PagedResult<ImagingOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Imaging.ImagingOrderRead);
            #endregion
        }

        private static int Page(int? pageNumber) => Math.Max(1, pageNumber ?? 1);

        private static int Size(int? pageSize) => Math.Clamp(pageSize ?? RadiologyWorkspace.DefaultPageSize, 1, RadiologyWorkspace.DefaultPageSize);
    }
}
