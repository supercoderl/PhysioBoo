using MediatR;
using PhysioBoo.Application.Commands.Payments.CreatePayment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PaymentEndpoints
    {
        public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/payments")
                .WithTags("Payments")
                .WithOpenApi();

            // Create payment
            group.MapPost("/create", async (
                CreatePaymentViewModel newPayment,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePaymentCommand(newPayment));

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

                return Results.Created($"/api/payments/{newPayment.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPayment.Id
                });
            }).WithName("CreatePayment")
            .WithSummary("Create new payment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
