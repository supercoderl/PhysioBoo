using PhysioBoo.Application.Commands.Rewards.CreateReward;
using PhysioBoo.Application.Commands.Rewards.DeleteReward;
using PhysioBoo.Application.Commands.Rewards.UpdateReward;
using PhysioBoo.Application.Queries.Rewards.GetAll;
using PhysioBoo.Application.ViewModels.Rewards;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class RewardEndpoints
    {
        public static void MapRewardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/rewards")
                .WithTags("Rewards")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Rewards
            group.MapPost("/search", async (
                [FromBody] PagedRequest<RewardFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<RewardViewModel> result = await bus.QueryAsync(new GetAllRewardsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<RewardViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchRewards")
            .WithSummary("Retrieve a paginated list of rewards with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<RewardViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<RewardViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.RewardRead);
            #endregion

            #region Create Reward
            group.MapPost("", async (
                [FromBody] CreateRewardViewModel newReward,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateRewardCommand(newId, newReward));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("CreateReward")
            .WithSummary("Create a new reward.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.RewardCreate);
            #endregion

            #region Update Reward
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateRewardViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateRewardCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateReward")
            .WithSummary("Update a reward.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.RewardUpdate);
            #endregion

            #region Delete Reward
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteRewardCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteReward")
            .WithSummary("Delete a reward (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.RewardDelete);
            #endregion
        }
    }
}
