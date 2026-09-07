using PhysioBoo.Application.Commands.MedicineInventories.AdjustQuantity;
using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.Commands.MedicineInventories.DisposeBatch;
using PhysioBoo.Application.Commands.MedicineInventories.LockBatch;
using PhysioBoo.Application.Commands.MedicineInventories.ReceiveStock;
using PhysioBoo.Application.Commands.MedicineInventories.ReserveBatch;
using PhysioBoo.Application.Commands.MedicineInventories.TransferBatch;
using PhysioBoo.Application.Commands.MedicineInventories.UpdateMedicineInventory;
using PhysioBoo.Application.ViewModels.MedicineInventories;





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

            // Update medicine inventory
            group.MapPatch("/{id:guid}", async (
                Guid id,
                UpdateMedicineInventoryViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicineInventoryCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateMedicineInventory")
            .WithSummary("Update an existing medicine inventory batch")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Receive stock into a batch
            group.MapPost("/{id:guid}/receive", async (
                Guid id,
                ReceiveStockViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ReceiveStockCommand(request, id));

                return Results.NoContent();
            }).WithName("ReceiveStock")
            .WithSummary("Receive additional stock into a batch")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Transfer a batch to a different warehouse zone
            group.MapPost("/{id:guid}/transfer", async (
                Guid id,
                TransferBatchViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new TransferBatchCommand(request, id));

                return Results.NoContent();
            }).WithName("TransferBatch")
            .WithSummary("Transfer a batch to a different warehouse zone")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Adjust a batch's available quantity
            group.MapPost("/{id:guid}/adjust", async (
                Guid id,
                AdjustQuantityViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AdjustQuantityCommand(request, id));

                return Results.NoContent();
            }).WithName("AdjustQuantity")
            .WithSummary("Adjust a batch's available quantity, with a reason")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Reserve part of a batch
            group.MapPost("/{id:guid}/reserve", async (
                Guid id,
                ReserveBatchViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ReserveBatchCommand(request, id));

                return Results.NoContent();
            }).WithName("ReserveBatch")
            .WithSummary("Reserve part of a batch's available quantity")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Lock a batch
            group.MapPost("/{id:guid}/lock", async (
                Guid id,
                LockBatchViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new LockBatchCommand(request, id));

                return Results.NoContent();
            }).WithName("LockBatch")
            .WithSummary("Lock a batch, freezing it from sale/dispense/transfer")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);

            // Dispose a batch
            group.MapPost("/{id:guid}/dispose", async (
                Guid id,
                DisposeBatchViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DisposeBatchCommand(request, id));

                return Results.NoContent();
            }).WithName("DisposeBatch")
            .WithSummary("Dispose a batch, permanently removing it from the sellable pool")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryUpdate);
        }
    }
}
