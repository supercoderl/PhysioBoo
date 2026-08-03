using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineInventoryEndpoints
    {
        public static void MapMedicineInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medicine-inventories")
                .WithTags("Medicine Inventories")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create medicine inventory
            group.MapPost("/create", async (
                CreateMedicineInventoryViewModel newMedicineInventory,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicineInventoryCommand(newMedicineInventory));

                return Results.Created($"/api/medicine-inventories/{newMedicineInventory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicineInventory.Id
                });
            }).WithName("CreateMedicineInventory")
            .WithSummary("Create new medicine inventory")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryCreate);
        }
    }
}
