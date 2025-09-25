using MediatR;
using PhysioBoo.Application.Commands.BillItems.CreateBillItem;
using PhysioBoo.Application.ViewModels.BillItems;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class BillItemEndpoints
    {
        public static void MapBillItemEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/bill-items")
                .WithTags("Bill Items")
                .WithOpenApi();

            // Create bill item
            group.MapPost("/create", async (
                CreateBillItemViewModel newBillItem,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateBillItemCommand(newBillItem));

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

                return Results.Created($"/api/bill-items/{newBillItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newBillItem.Id
                });
            }).WithName("CreateBillItem")
            .WithSummary("Create new bill item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
