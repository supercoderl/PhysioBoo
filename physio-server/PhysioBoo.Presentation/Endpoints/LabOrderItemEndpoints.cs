using MediatR;
using PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem;
using PhysioBoo.Application.ViewModels.LabOrderItems;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabOrderItemEndpoints
    {
        public static void MapLabOrderItemEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-order-items")
                .WithTags("Lab Order Items")
                .WithOpenApi();

            // Create lab order item
            group.MapPost("/create", async (
                CreateLabOrderItemViewModel newLabOrderItem,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateLabOrderItemCommand(newLabOrderItem));

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

                return Results.Created($"/api/lab-order-items/{newLabOrderItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabOrderItem.Id
                });
            }).WithName("CreateLabOrderItem")
            .WithSummary("Create new lab order item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
