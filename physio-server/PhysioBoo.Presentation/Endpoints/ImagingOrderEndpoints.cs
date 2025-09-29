using MediatR;
using PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder;
using PhysioBoo.Application.ViewModels.ImagingOrders;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingOrderEndpoints
    {
        public static void MapImagingOrderEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/imaging-orders")
                .WithTags("Imaging Orders")
                .WithOpenApi();

            // Create imaging order
            group.MapPost("/create", async (
                CreateImagingOrderViewModel newImagingOrder,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateImagingOrderCommand(newImagingOrder, user.GetUserId()));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

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
