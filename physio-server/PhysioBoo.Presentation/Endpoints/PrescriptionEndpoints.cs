using PhysioBoo.Application.Commands.Prescriptions.CancelPrescription;
using PhysioBoo.Application.Commands.Prescriptions.CreatePrescription;
using PhysioBoo.Application.Commands.Prescriptions.IssuePrescription;
using PhysioBoo.Application.Commands.Prescriptions.UpdatePrescription;
using PhysioBoo.Application.Queries.Prescriptions.CheckClinicalWarnings;
using PhysioBoo.Application.Queries.Prescriptions.GetById;
using PhysioBoo.Application.Queries.Prescriptions.GetCostEstimate;
using PhysioBoo.Application.ViewModels.Prescriptions;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrescriptionEndpoints
    {
        public static void MapPrescriptionEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/prescriptions")
                .WithTags("Prescription")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create prescription
            group.MapPost("/create", async (
                CreatePrescriptionViewModel newPrescription,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreatePrescriptionCommand(newPrescription));

                return Results.Created($"/api/prescriptions/{newPrescription.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPrescription.Id
                });
            }).WithName("CreatePrescription")
            .WithSummary("Create new prescription")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionCreate);

            group.MapGet("/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                PrescriptionDraftViewModel? result = await bus.QueryAsync(new GetPrescriptionByIdQuery(id));
                return result is null ? Results.NotFound() : Results.Ok(new ResponseMessage<PrescriptionDraftViewModel> { Success = true, Data = result });
            }).WithName("GetPrescriptionById")
            .Produces<ResponseMessage<PrescriptionDraftViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);

            group.MapPut("/{id:guid}", async (Guid id, UpdatePrescriptionViewModel body, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new UpdatePrescriptionCommand(body with { Id = id }));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).RequireAuthorization(Permissions.Pharmacy.PrescriptionUpdate);

            group.MapPost("/{id:guid}/issue", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new IssuePrescriptionCommand(id));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).RequireAuthorization(Permissions.Pharmacy.PrescriptionIssue);

            group.MapPost("/{id:guid}/cancel", async (Guid id, CancelPrescriptionViewModel body, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new CancelPrescriptionCommand(id, body));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).RequireAuthorization(Permissions.Pharmacy.PrescriptionCancel);

            group.MapPost("/cds-check", async (CdsCheckViewModel body, IMediatorHandler bus, CancellationToken ct) =>
            {
                Dictionary<Guid, List<ClinicalWarningViewModel>> result = await bus.QueryAsync(new CheckClinicalWarningsQuery(body.PatientId, body.Items));
                return Results.Ok(new ResponseMessage<Dictionary<Guid, List<ClinicalWarningViewModel>>> { Success = true, Data = result });
            }).WithName("CheckPrescriptionClinicalWarnings")
            .WithSummary("Run CDS check (allergy/duplicate) against the current draft items")
            .Produces<ResponseMessage<Dictionary<Guid, List<ClinicalWarningViewModel>>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);

            group.MapPost("/{id:guid}/cost-estimate", async (Guid id, List<CostEstimateItemInput> items, IMediatorHandler bus, CancellationToken ct) =>
            {
                PrescriptionSummaryTotalsViewModel? result = await bus.QueryAsync(new GetCostEstimateQuery(id, items));
                return Results.Ok(new ResponseMessage<PrescriptionSummaryTotalsViewModel> { Success = true, Data = result });
            }).WithName("GetPrescriptionCostEstimate")
            .WithSummary("Estimate total cost / insurance coverage / patient payment for a draft's items")
            .Produces<ResponseMessage<PrescriptionSummaryTotalsViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);
        }
    }
}
