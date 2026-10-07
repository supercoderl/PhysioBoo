using PhysioBoo.Application.Commands.HomeFeatures.CreateHomeFeature;
using PhysioBoo.Application.Commands.HomeFeatures.DeleteHomeFeature;
using PhysioBoo.Application.Commands.HomeFeatures.UpdateHomeFeature;
using PhysioBoo.Application.Queries.HomeFeatures.GetAll;
using PhysioBoo.Application.Queries.HomeFeatures.GetById;
using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HomeFeatureEndpoints
    {
        public static void MapHomeFeatureEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/home-features")
                .WithTags("Home Features")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search
            group.MapPost("/search", async (
                [FromBody] PagedRequest<HomeFeatureFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<HomeFeatureViewModel> result = await bus.QueryAsync(new GetAllHomeFeaturesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HomeFeatureViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHomeFeatures")
            .WithSummary("Retrieve a paginated list of home page features.")
            .Produces<ResponseMessage<PagedResult<HomeFeatureViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Create
            group.MapPost("", async (
                [FromBody] SaveHomeFeatureViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateHomeFeatureCommand(newId, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("CreateHomeFeature")
            .WithSummary("Create a home page feature.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion

            #region Get By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                HomeFeatureViewModel? result = await bus.QueryAsync(new GetHomeFeatureByIdQuery(id));

                return Results.Ok(new ResponseMessage<HomeFeatureViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHomeFeatureById")
            .WithSummary("Retrieve a single home page feature.")
            .Produces<ResponseMessage<HomeFeatureViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Update
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] SaveHomeFeatureViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHomeFeatureCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateHomeFeature")
            .WithSummary("Update a home page feature.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion

            #region Delete
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHomeFeatureCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteHomeFeature")
            .WithSummary("Delete a home page feature.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion
        }
    }
}
