using MediatR;
using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineInventoryEndpoints
    {
        public static void MapMedicineInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/medicine-inventories")
                .WithTags("Medicine Inventories")
                .WithOpenApi();

            // Create medicine inventory
            group.MapPost("/create", async (
                CreateMedicineInventoryViewModel newMedicineInventory,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateMedicineInventoryCommand(newMedicineInventory));

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

                return Results.Created($"/api/medicine-inventories/{newMedicineInventory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicineInventory.Id
                });
            }).WithName("CreateMedicineInventory")
            .WithSummary("Create new medicine inventory")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
