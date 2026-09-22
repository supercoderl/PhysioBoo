
using PhysioBoo.Application.Commands.HomeSettings.UpdateHomeSetting;
using PhysioBoo.Application.Queries.HomeSettings;
using PhysioBoo.Application.ViewModels.HomeSettings;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HomeSettingsEndpoints
    {
        public static void MapHomeSettingsEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/home-settings")
                .WithTags("Home Settings")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Get Home Settings
            group.MapGet("", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                HomeSettingsViewModel? result = await bus.QueryAsync(new GetHomeSettingsQuery());

                return Results.Ok(new ResponseMessage<HomeSettingsViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHomeSettings")
            .WithSummary("Retrieve the current tenant's home page configuration.")
            .Produces<ResponseMessage<HomeSettingsViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Update Home Settings
            group.MapPut("", async (
                [FromBody] UpdateHomeSettingViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHomeSettingCommand(request));

                HomeSettingsViewModel? result = await bus.QueryAsync(new GetHomeSettingsQuery());

                return Results.Ok(new ResponseMessage<HomeSettingsViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("UpdateHomeSettings")
            .WithSummary("Create or update the current tenant's home page configuration.")
            .Produces<ResponseMessage<HomeSettingsViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HomeSettingsViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion
        }
    }
}
