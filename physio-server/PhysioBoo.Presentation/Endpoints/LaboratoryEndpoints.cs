using PhysioBoo.Application.Commands.Laboratory.PlaceLabOrder;
using PhysioBoo.Application.Commands.Laboratory.AcknowledgeLabAlert;
using PhysioBoo.Application.Commands.Laboratory.ApproveLabResult;
using PhysioBoo.Application.Commands.Laboratory.CollectLabSample;
using PhysioBoo.Application.Commands.Laboratory.RecollectLabSample;
using PhysioBoo.Application.Commands.Laboratory.RejectLabResult;
using PhysioBoo.Application.Commands.Laboratory.RejectLabSample;
using PhysioBoo.Application.Commands.Laboratory.ReturnLabResultForReview;
using PhysioBoo.Application.Commands.Laboratory.UpdateLabResult;
using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Application.Queries.Laboratory.GetAlerts;
using PhysioBoo.Application.Queries.Laboratory.GetOrders;
using PhysioBoo.Application.Queries.Laboratory.GetPatientHistory;
using PhysioBoo.Application.Queries.Laboratory.GetPatientSummary;
using PhysioBoo.Application.Queries.Laboratory.GetResults;
using PhysioBoo.Application.Queries.Laboratory.GetSamples;
using PhysioBoo.Application.Queries.Laboratory.GetStats;
using PhysioBoo.Application.Queries.Laboratory.GetTrends;
using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Laboratory workspace (paraclinical/laboratory): orders, sample tracking, result verification and alerts.
    /// Lists are read with GET and the page filters them client-side, so the default page is large.
    /// </summary>
    public static class LaboratoryEndpoints
    {
        public static void MapLaboratoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/laboratory")
                .WithTags("Laboratory")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Dashboard
            group.MapGet("/stats", async (IMediatorHandler bus) =>
            {
                LabStatsViewModel result = await bus.QueryAsync(new GetLabStatsQuery());
                return Results.Ok(new ResponseMessage<LabStatsViewModel> { Success = true, Data = result });
            }).WithName("GetLaboratoryStats")
            .WithSummary("KPI totals for the laboratory workspace.")
            .Produces<ResponseMessage<LabStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);

            group.MapGet("/trends", async (IMediatorHandler bus) =>
            {
                LabDashboardTrendViewModel result = await bus.QueryAsync(new GetLabTrendsQuery());
                return Results.Ok(new ResponseMessage<LabDashboardTrendViewModel> { Success = true, Data = result });
            }).WithName("GetLaboratoryTrends")
            .WithSummary("Charts for the laboratory dashboard tab.")
            .Produces<ResponseMessage<LabDashboardTrendViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);
            #endregion

            #region Alerts
            group.MapGet("/alerts", async (IMediatorHandler bus) =>
            {
                List<LabCriticalAlertViewModel> result = await bus.QueryAsync(new GetLabAlertsQuery());
                return Results.Ok(new ResponseMessage<List<LabCriticalAlertViewModel>> { Success = true, Data = result });
            }).WithName("GetLaboratoryAlerts")
            .WithSummary("Open laboratory alerts, plus those acknowledged in the last 24 hours.")
            .Produces<ResponseMessage<List<LabCriticalAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);

            group.MapPost("/alerts/{id:guid}/acknowledge", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new AcknowledgeLabAlertCommand(id));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("AcknowledgeLaboratoryAlert")
            .WithSummary("Acknowledge a laboratory alert.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.AlertAcknowledge);
            #endregion

            #region Ordering
            group.MapPost("/orders", async ([FromBody] PlaceLabOrderViewModel body, IMediatorHandler bus) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new PlaceLabOrderCommand(newId, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = newId });
            }).WithName("PlaceLaboratoryOrder")
            .WithSummary("Order lab tests for a patient; the order joins the patient's latest visit and gets a LAB- number.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabOrderCreate);
            #endregion

            #region Lists
            group.MapGet("/orders/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<LabOrderRowViewModel> result = await bus.QueryAsync(new GetLabOrdersQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<LabOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("SearchLaboratoryOrders")
            .WithSummary("Lab orders with derived collection, lab and verification status, newest first.")
            .Produces<ResponseMessage<PagedResult<LabOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);

            group.MapGet("/samples/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<LabSampleViewModel> result = await bus.QueryAsync(new GetLabSamplesQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<LabSampleViewModel>> { Success = true, Data = result });
            }).WithName("SearchLaboratorySamples")
            .WithSummary("Specimens (one per ordered test) with their tracking timeline.")
            .Produces<ResponseMessage<PagedResult<LabSampleViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);

            group.MapGet("/results/search", async ([FromQuery] int? pageNumber, [FromQuery] int? pageSize, IMediatorHandler bus) =>
            {
                PagedResult<LabResultEntryViewModel> result = await bus.QueryAsync(new GetLabResultsQuery(Page(pageNumber), Size(pageSize)));
                return Results.Ok(new ResponseMessage<PagedResult<LabResultEntryViewModel>> { Success = true, Data = result });
            }).WithName("SearchLaboratoryResults")
            .WithSummary("Entered results awaiting or past verification, newest first.")
            .Produces<ResponseMessage<PagedResult<LabResultEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);
            #endregion

            #region Samples
            group.MapPatch("/samples/{id:guid}/collect", async (Guid id, [FromBody] CollectLabSampleViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new CollectLabSampleCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("CollectLaboratorySample")
            .WithSummary("Mark a specimen collected. An empty collector name records the signed-in user.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.SampleManage);

            group.MapPost("/samples/{id:guid}/recollect", async (Guid id, [FromBody] LabReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RecollectLabSampleCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RecollectLaboratorySample")
            .WithSummary("Send a specimen back to the collection queue.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.SampleManage);

            group.MapPost("/samples/{id:guid}/reject", async (Guid id, [FromBody] LabReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RejectLabSampleCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RejectLaboratorySample")
            .WithSummary("Reject a specimen and raise a sample-rejected alert.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.SampleManage);
            #endregion

            #region Results
            group.MapPatch("/results/{id:guid}", async (Guid id, [FromBody] UpdateLabResultViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new UpdateLabResultCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("UpdateLaboratoryResult")
            .WithSummary("Enter or change a result value. The flag is computed from the reference range; panic values raise an alert.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.ResultEnter);

            group.MapPost("/results/{id:guid}/approve", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ApproveLabResultCommand(id));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("ApproveLaboratoryResult")
            .WithSummary("Verify and release a result.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.ResultVerify);

            group.MapPost("/results/{id:guid}/reject", async (Guid id, [FromBody] LabReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RejectLabResultCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RejectLaboratoryResult")
            .WithSummary("Reject a result during verification.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.ResultVerify);

            group.MapPost("/results/{id:guid}/return-for-review", async (Guid id, [FromBody] LabReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ReturnLabResultForReviewCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("ReturnLaboratoryResultForReview")
            .WithSummary("Return a result to the technician for review.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.ResultVerify);
            #endregion

            #region Patient
            group.MapGet("/patients/{patientKey}/summary", async (string patientKey, IMediatorHandler bus) =>
            {
                LabPatientResultSummaryViewModel? result = await bus.QueryAsync(new GetLabPatientSummaryQuery(patientKey));
                return Results.Ok(new ResponseMessage<LabPatientResultSummaryViewModel?> { Success = true, Data = result });
            }).WithName("GetLaboratoryPatientSummary")
            .WithSummary("Patient header for the result drawer. Accepts a patient id or medical record number.")
            .Produces<ResponseMessage<LabPatientResultSummaryViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);

            group.MapGet("/patients/{patientKey}/history", async (string patientKey, IMediatorHandler bus) =>
            {
                PagedResult<LabOrderRowViewModel> result = await bus.QueryAsync(new GetLabPatientHistoryQuery(patientKey));
                return Results.Ok(new ResponseMessage<PagedResult<LabOrderRowViewModel>> { Success = true, Data = result });
            }).WithName("GetLaboratoryPatientHistory")
            .WithSummary("A patient's lab orders, newest first. Accepts a patient id or medical record number.")
            .Produces<ResponseMessage<PagedResult<LabOrderRowViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Lab.LabOrderRead);
            #endregion
        }

        private static int Page(int? pageNumber) => Math.Max(1, pageNumber ?? 1);

        private static int Size(int? pageSize) => Math.Clamp(pageSize ?? LabWorkspace.DefaultPageSize, 1, LabWorkspace.DefaultPageSize);
    }
}
