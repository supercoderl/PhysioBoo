using PhysioBoo.Application.Commands.Campaigns.CreateCampaign;
using PhysioBoo.Application.Commands.Campaigns.DeleteCampaign;
using PhysioBoo.Application.Commands.Campaigns.UpdateCampaign;
using PhysioBoo.Application.Queries.Campaigns.GetAll;
using PhysioBoo.Application.Queries.Campaigns.GetById;
using PhysioBoo.Application.Queries.Campaigns.GetStats;
using PhysioBoo.Application.ViewModels.Campaigns;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class CampaignEndpoints
    {
        public static void MapCampaignEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/campaigns")
                .WithTags("Campaigns")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Campaigns
            group.MapPost("/search", async (
                [FromBody] PagedRequest<CampaignFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<CampaignViewModel> result = await bus.QueryAsync(new GetAllCampaignsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<CampaignViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchCampaigns")
            .WithSummary("Retrieve a paginated list of campaigns with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<CampaignViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<CampaignViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.CampaignRead);
            #endregion

            #region Get Campaign Stats
            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CampaignStatsViewModel result = await bus.QueryAsync(new GetCampaignStatsQuery());

                return Results.Ok(new ResponseMessage<CampaignStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetCampaignStats")
            .WithSummary("Retrieve KPI totals for campaigns.")
            .Produces<ResponseMessage<CampaignStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Crm.CampaignRead);
            #endregion

            #region Create Campaign
            group.MapPost("", async (
                [FromBody] CreateCampaignViewModel newCampaign,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateCampaignCommand(newId, newCampaign));

                return Results.CreatedAtRoute(
                    "GetCampaignById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateCampaign")
            .WithSummary("Create a new campaign.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.CampaignCreate);
            #endregion

            #region Get Campaign By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CampaignViewModel? result = await bus.QueryAsync(new GetCampaignByIdQuery(id));

                return Results.Ok(new ResponseMessage<CampaignViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetCampaignById")
            .WithSummary("Retrieve a single campaign.")
            .Produces<ResponseMessage<CampaignViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<CampaignViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.CampaignRead);
            #endregion

            #region Update Campaign
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateCampaignViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateCampaignCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateCampaign")
            .WithSummary("Update a campaign.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.CampaignUpdate);
            #endregion

            #region Delete Campaign
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteCampaignCommand(id, false));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteCampaign")
            .WithSummary("Delete a single campaign.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.CampaignDelete);
            #endregion
        }
    }
}
