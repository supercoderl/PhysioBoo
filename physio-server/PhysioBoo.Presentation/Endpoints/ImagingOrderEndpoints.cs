using PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder;
using PhysioBoo.Application.ViewModels.ImagingOrders;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingOrderEndpoints
    {
        public static void MapImagingOrderEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/imaging-orders")
                .WithTags("Imaging Orders")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create imaging order
            group.MapPost("/create", async (
                CreateImagingOrderViewModel newImagingOrder,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateImagingOrderCommand(newImagingOrder));

                return Results.Created($"/api/imaging-orders/{newImagingOrder.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newImagingOrder.Id
                });
            }).WithName("CreateImagingOrder")
            .WithSummary("Create new imaging order")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
