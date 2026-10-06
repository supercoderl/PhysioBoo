using PhysioBoo.Application.Commands.InsuranceClaims.AddInsuranceClaimActivity;
using PhysioBoo.Application.Commands.InsuranceClaims.CreateInsuranceClaim;
using PhysioBoo.Application.Commands.InsuranceClaims.ProcessInsuranceClaim;
using PhysioBoo.Application.Commands.InsuranceClaims.UploadInsuranceClaimDocument;
using PhysioBoo.Application.Queries.InsuranceClaims.GetAll;
using PhysioBoo.Application.Queries.InsuranceClaims.GetById;
using PhysioBoo.Application.Queries.InsuranceClaims.GetProvidersTree;
using PhysioBoo.Application.Queries.InsuranceClaims.GetStats;
using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class InsuranceClaimEndpoints
    {
        // The claims workspace filters its queue client-side, so the default page is generous.
        private const int DefaultQueuePageSize = 200;

        public static void MapInsuranceClaimEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/insurance")
                .WithTags("Insurance Claims")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Claims
            group.MapGet("/claims", async (
                [FromQuery] int? page,
                [FromQuery] int? pageSize,
                [FromQuery] string? search,
                [FromQuery] string? status,
                [FromQuery] Guid? providerId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedRequest<InsuranceClaimFilter> request = new PagedRequest<InsuranceClaimFilter>
                {
                    PageNumber = page ?? 1,
                    PageSize = pageSize ?? DefaultQueuePageSize,
                    Search = search,
                    Filter = new InsuranceClaimFilter(status, providerId)
                };

                PagedResult<InsuranceClaimCardViewModel> result = await bus.QueryAsync(new GetAllInsuranceClaimsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<InsuranceClaimCardViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchInsuranceClaims")
            .WithSummary("Retrieve the insurance claims queue.")
            .Produces<ResponseMessage<PagedResult<InsuranceClaimCardViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);
            #endregion

            #region Get Claim Stats
            group.MapGet("/claims/stats", async (
                [FromQuery] DateTime? dateFrom,
                [FromQuery] DateTime? dateTo,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InsuranceClaimStatsViewModel result = await bus.QueryAsync(new GetInsuranceClaimStatsQuery(dateFrom, dateTo));

                return Results.Ok(new ResponseMessage<InsuranceClaimStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInsuranceClaimStats")
            .WithSummary("Retrieve claim health, risk and approval velocity KPIs.")
            .Produces<ResponseMessage<InsuranceClaimStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);
            #endregion

            #region Get Providers Tree
            group.MapGet("/providers/tree", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<InsuranceProviderNodeViewModel> result = await bus.QueryAsync(new GetInsuranceProvidersTreeQuery());

                return Results.Ok(new ResponseMessage<List<InsuranceProviderNodeViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInsuranceProvidersTree")
            .WithSummary("Retrieve active insurance providers with claim counts.")
            .Produces<ResponseMessage<List<InsuranceProviderNodeViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);
            #endregion

            #region Create Claim
            group.MapPost("/claims", async (
                [FromBody] CreateInsuranceClaimViewModel newClaim,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateInsuranceClaimCommand(newId, newClaim));

                InsuranceClaimDetailViewModel? result = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(newId));

                return Results.CreatedAtRoute(
                    "GetInsuranceClaimById",
                    new { id = newId },
                    new ResponseMessage<InsuranceClaimDetailViewModel?>
                    {
                        Success = true,
                        Data = result
                    }
                );
            }).WithName("CreateInsuranceClaim")
            .WithSummary("Create a new insurance claim.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimCreate);
            #endregion

            #region Get Claim By Id
            group.MapGet("/claims/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InsuranceClaimDetailViewModel? result = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id));

                return Results.Ok(new ResponseMessage<InsuranceClaimDetailViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInsuranceClaimById")
            .WithSummary("Retrieve a claim with documents, timeline, notes, communication and audit log.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);
            #endregion

            #region Workflow Actions
            group.MapPost("/claims/{id:guid}/submit", ([FromRoute] Guid id, [FromBody] SubmitInsuranceClaimViewModel body, IMediatorHandler bus) =>
                ProcessAsync(bus, new ProcessInsuranceClaimCommand(id, InsuranceClaimAction.Submit, text: body.Notes)))
            .WithName("SubmitInsuranceClaim")
            .WithSummary("Submit a claim to the insurer (all required documents must be uploaded).")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimUpdate);

            group.MapPost("/claims/{id:guid}/approve", ([FromRoute] Guid id, [FromBody] ApproveInsuranceClaimViewModel body, IMediatorHandler bus) =>
                ProcessAsync(bus, new ProcessInsuranceClaimCommand(id, InsuranceClaimAction.Approve, amount: body.ApprovedAmount, text: body.Notes)))
            .WithName("ApproveInsuranceClaim")
            .WithSummary("Record the insurer's approval.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimProcess);

            group.MapPost("/claims/{id:guid}/reject", ([FromRoute] Guid id, [FromBody] RejectInsuranceClaimViewModel body, IMediatorHandler bus) =>
                ProcessAsync(bus, new ProcessInsuranceClaimCommand(id, InsuranceClaimAction.Reject, text: body.Reason)))
            .WithName("RejectInsuranceClaim")
            .WithSummary("Record the insurer's rejection.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimProcess);

            group.MapPost("/claims/{id:guid}/appeal", ([FromRoute] Guid id, [FromBody] AppealInsuranceClaimViewModel body, IMediatorHandler bus) =>
                ProcessAsync(bus, new ProcessInsuranceClaimCommand(id, InsuranceClaimAction.Appeal, text: body.GroundsForAppeal)))
            .WithName("AppealInsuranceClaim")
            .WithSummary("Appeal a rejected claim.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimUpdate);

            group.MapPost("/claims/{id:guid}/settle", ([FromRoute] Guid id, [FromBody] SettleInsuranceClaimViewModel body, IMediatorHandler bus) =>
                ProcessAsync(bus, new ProcessInsuranceClaimCommand(id, InsuranceClaimAction.Settle, amount: body.SettledAmount, effectiveDate: body.SettlementDate, method: body.Method)))
            .WithName("SettleInsuranceClaim")
            .WithSummary("Record the insurer's payment for an approved claim.")
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDetailViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimProcess);
            #endregion

            #region Upload Document
            group.MapPost("/upload", async (
                [FromForm] Guid claimId,
                [FromForm] string? documentType,
                IFormFile file,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UploadInsuranceClaimDocumentCommand command = new UploadInsuranceClaimDocumentCommand(claimId, file, documentType ?? string.Empty);

                await bus.SendCommandAsync(command);

                InsuranceClaimDocumentViewModel? document = null;
                if (command.DocumentId.HasValue)
                {
                    InsuranceClaimDetailViewModel? claim = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(claimId));
                    document = claim?.Documents.FirstOrDefault(d => d.Id == command.DocumentId.Value);
                }

                return Results.Ok(new ResponseMessage<InsuranceClaimDocumentViewModel?>
                {
                    Success = true,
                    Data = document
                });
            }).WithName("UploadInsuranceClaimDocument")
            .WithSummary("Upload a supporting document to a claim (fills the next missing required slot).")
            .Produces<ResponseMessage<InsuranceClaimDocumentViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimDocumentViewModel?>>(StatusCodes.Status400BadRequest)
            .DisableAntiforgery()
            .RequireAuthorization(Permissions.Finance.InsuranceClaimUpdate);
            #endregion

            #region Claim Sub-resources
            group.MapGet("/claims/{id:guid}/timeline", async (Guid id, IMediatorHandler bus) =>
                Ok((await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id)))?.Timeline ?? new()))
            .WithName("GetInsuranceClaimTimeline")
            .Produces<ResponseMessage<List<InsuranceClaimTimelineEventViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);

            group.MapGet("/claims/{id:guid}/notes", async (Guid id, IMediatorHandler bus) =>
                Ok((await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id)))?.Notes ?? new()))
            .WithName("GetInsuranceClaimNotes")
            .Produces<ResponseMessage<List<InsuranceClaimNoteViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);

            group.MapGet("/claims/{id:guid}/communication", async (Guid id, IMediatorHandler bus) =>
                Ok((await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id)))?.Communication ?? new()))
            .WithName("GetInsuranceClaimCommunication")
            .Produces<ResponseMessage<List<InsuranceClaimMessageViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);

            group.MapGet("/claims/{id:guid}/audit-logs", async (Guid id, IMediatorHandler bus) =>
                Ok((await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id)))?.AuditLogs ?? new()))
            .WithName("GetInsuranceClaimAuditLogs")
            .Produces<ResponseMessage<List<InsuranceClaimAuditLogViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimRead);

            group.MapPost("/claims/{id:guid}/notes", async (
                [FromRoute] Guid id,
                [FromBody] AddInsuranceClaimNoteViewModel body,
                IMediatorHandler bus
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new AddInsuranceClaimActivityCommand(id, newId, InsuranceClaimActivityKind.Note, body.Message));

                InsuranceClaimDetailViewModel? claim = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id));
                return Ok(claim?.Notes.FirstOrDefault(n => n.Id == newId));
            }).WithName("AddInsuranceClaimNote")
            .WithSummary("Add an internal note to a claim.")
            .Produces<ResponseMessage<InsuranceClaimNoteViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimNoteViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimUpdate);

            group.MapPost("/claims/{id:guid}/communication", async (
                [FromRoute] Guid id,
                [FromBody] AddInsuranceClaimMessageViewModel body,
                IMediatorHandler bus
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new AddInsuranceClaimActivityCommand(id, newId, InsuranceClaimActivityKind.Message, body.Message, body.Direction));

                InsuranceClaimDetailViewModel? claim = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(id));
                return Ok(claim?.Communication.FirstOrDefault(m => m.Id == newId));
            }).WithName("AddInsuranceClaimMessage")
            .WithSummary("Log a message exchanged with the insurer.")
            .Produces<ResponseMessage<InsuranceClaimMessageViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceClaimMessageViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Finance.InsuranceClaimUpdate);
            #endregion
        }

        /// <summary>
        /// Runs a workflow command, then returns the refreshed claim (a superset of the queue card).
        /// </summary>
        private static async Task<IResult> ProcessAsync(IMediatorHandler bus, ProcessInsuranceClaimCommand command)
        {
            await bus.SendCommandAsync(command);
            InsuranceClaimDetailViewModel? result = await bus.QueryAsync(new GetInsuranceClaimByIdQuery(command.Id));
            return Ok(result);
        }

        private static IResult Ok<T>(T data)
        {
            return Results.Ok(new ResponseMessage<T>
            {
                Success = true,
                Data = data
            });
        }
    }
}
