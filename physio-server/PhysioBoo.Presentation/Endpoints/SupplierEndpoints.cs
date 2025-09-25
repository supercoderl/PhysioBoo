using MediatR;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class SupplierEndpoints
    {
        public static void MapSupplierEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/suppliers")
                .WithTags("Supplier")
                .WithOpenApi();

            // Create supplier
            group.MapPost("/create", async (
                CreateSupplierViewModel newSupplier,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateSupplierCommand(newSupplier));

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

                return Results.Created($"/api/suppliers/{newSupplier.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newSupplier.Id
                });
            }).WithName("CreatSupplier")
            .WithSummary("Create new supplier")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
