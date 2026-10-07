using PhysioBoo.Application.Commands.HomeBanners.CreateHomeBanner;
using PhysioBoo.Application.Commands.HomeBanners.DeleteHomeBanner;
using PhysioBoo.Application.Commands.HomeBanners.UpdateHomeBanner;
using PhysioBoo.Application.Queries.HomeBanners.GetAll;
using PhysioBoo.Application.Queries.HomeBanners.GetById;
using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HomeBannerEndpoints
    {
        public static void MapHomeBannerEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/home-banners")
                .WithTags("Home Banners")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search
            group.MapPost("/search", async (
                [FromBody] PagedRequest<HomeBannerFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<HomeBannerViewModel> result = await bus.QueryAsync(new GetAllHomeBannersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HomeBannerViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHomeBanners")
            .WithSummary("Retrieve a paginated list of home page banners.")
            .Produces<ResponseMessage<PagedResult<HomeBannerViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Create
            group.MapPost("", async (
                [FromBody] SaveHomeBannerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateHomeBannerCommand(newId, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("CreateHomeBanner")
            .WithSummary("Create a home page banner.")
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
                HomeBannerViewModel? result = await bus.QueryAsync(new GetHomeBannerByIdQuery(id));

                return Results.Ok(new ResponseMessage<HomeBannerViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHomeBannerById")
            .WithSummary("Retrieve a single home page banner.")
            .Produces<ResponseMessage<HomeBannerViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Update
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] SaveHomeBannerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHomeBannerCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateHomeBanner")
            .WithSummary("Update a home page banner.")
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
                await bus.SendCommandAsync(new DeleteHomeBannerCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteHomeBanner")
            .WithSummary("Delete a home page banner.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion
        }
    }
}
