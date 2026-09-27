using PhysioBoo.Application.Commands.Leads.CreateLead;
using PhysioBoo.Application.Commands.Leads.DeleteLead;
using PhysioBoo.Application.Commands.Leads.UpdateLead;
using PhysioBoo.Application.Queries.Leads.GetAll;
using PhysioBoo.Application.Queries.Leads.GetById;
using PhysioBoo.Application.Queries.Leads.GetStats;
using PhysioBoo.Application.ViewModels.Leads;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LeadEndpoints
    {
        public static void MapLeadEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/leads")
                .WithTags("Leads")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Leads
            group.MapPost("/search", async (
                [FromBody] PagedRequest<LeadFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<LeadViewModel> result = await bus.QueryAsync(new GetAllLeadsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<LeadViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchLeads")
            .WithSummary("Retrieve a paginated list of leads with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<LeadViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LeadViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.LeadRead);
            #endregion

            #region Get Lead Stats
            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                LeadStatsViewModel result = await bus.QueryAsync(new GetLeadStatsQuery());

                return Results.Ok(new ResponseMessage<LeadStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLeadStats")
            .WithSummary("Retrieve KPI totals for the lead pipeline.")
            .Produces<ResponseMessage<LeadStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Crm.LeadRead);
            #endregion

            #region Create New Lead
            group.MapPost("", async (
                [FromBody] CreateLeadViewModel newLead,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateLeadCommand(newId, newLead));

                return Results.CreatedAtRoute(
                    "GetLeadById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateLead")
            .WithSummary("Create a new lead.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.LeadCreate);
            #endregion

            #region Get Lead By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                LeadViewModel? result = await bus.QueryAsync(new GetLeadByIdQuery(id));

                return Results.Ok(new ResponseMessage<LeadViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLeadById")
            .WithSummary("Retrieve a single lead.")
            .Produces<ResponseMessage<LeadViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LeadViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.LeadRead);
            #endregion

            #region Update Lead
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateLeadViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateLeadCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateLead")
            .WithSummary("Update a lead.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.LeadUpdate);
            #endregion

            #region Delete Lead
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteLeadCommand(id, false));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteLead")
            .WithSummary("Delete a single lead.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.LeadDelete);
            #endregion
        }
    }
}
