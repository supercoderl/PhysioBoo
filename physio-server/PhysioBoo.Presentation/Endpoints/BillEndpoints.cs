using MediatR;
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.ViewModels.Bills;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class BillEndpoints
    {
        public static void MapBillEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/bills")
                .WithTags("Bills")
                .WithOpenApi();

            // Create bill
            group.MapPost("/create", async (
                CreateBillViewModel newBill,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateBillCommand(newBill, user.GetUserId()));

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

                return Results.Created($"/api/bills/{newBill.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newBill.Id
                });
            }).WithName("CreateBill")
            .WithSummary("Create new bill")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
