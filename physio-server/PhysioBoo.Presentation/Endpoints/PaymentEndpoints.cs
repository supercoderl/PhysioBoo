using PhysioBoo.Application.Commands.Payments.CreatePayment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PaymentEndpoints
    {
        public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/payments")
                .WithTags("Payments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create payment
            group.MapPost("/create", async (
                CreatePaymentViewModel newPayment,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreatePaymentCommand(newPayment));

                return Results.Created($"/api/payments/{newPayment.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPayment.Id
                });
            }).WithName("CreatePayment")
            .WithSummary("Create new payment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Billing.PaymentCreate);
        }
    }
}
