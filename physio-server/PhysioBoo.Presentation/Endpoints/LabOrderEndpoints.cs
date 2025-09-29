using MediatR;
using PhysioBoo.Application.Commands.LabOrders.CreateLabOrder;
using PhysioBoo.Application.ViewModels.LabOrders;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabOrderEndpoints
    {
        public static void MapLabOrderEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/lab-orders")
                .WithTags("Lab Orders")
                .WithOpenApi();

            // Create lab order
            group.MapPost("/create", async (
                CreateLabOrderViewModel newLabOrder,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateLabOrderCommand(newLabOrder));

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

                return Results.Created($"/api/lab-orders/{newLabOrder.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabOrder.Id
                });
            }).WithName("CreateLabOrder")
            .WithSummary("Create new lab order")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
