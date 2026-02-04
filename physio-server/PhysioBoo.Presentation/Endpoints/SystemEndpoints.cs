using PhysioBoo.Application.Commands.Systems.Ip;
using PhysioBoo.Application.ViewModels.Systems;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class SystemEndpoints
    {
        public static void MapSystemEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/systems")
                .WithTags("System")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Block Ip
            group.MapPost("/block-ip", async (
                BlockIpViewModel blockIp,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new BlockIpCommand(blockIp.IpAddress, blockIp.Reason, blockIp.DurationMinutes));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "IP blocked successfully."
                });
            }).WithName("BlockIp")
            .WithSummary("Block Ip")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization("AdminPolicy");
            #endregion

            #region Unblock Ip
            group.MapPost("/unblock-ip", async (
                UnblockIpViewModel unblockIp,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UnblockIpCommand(unblockIp.IpAddress));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "IP unblocked successfully."
                });
            }).WithName("UnblockIp")
            .WithSummary("Unblock Ip")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization("AdminPolicy");
            #endregion
        }
    }
}
