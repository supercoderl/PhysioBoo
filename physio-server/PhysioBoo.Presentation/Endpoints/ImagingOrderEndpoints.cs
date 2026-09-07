using PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder;
using PhysioBoo.Application.ViewModels.ImagingOrders;





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
                CancellationToken ct
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
            .RequireAuthorization(Permissions.Imaging.ImagingOrderCreate);
        }
    }
}
