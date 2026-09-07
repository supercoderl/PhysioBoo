using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.Commands.Medicines.DeleteMedicine;
using PhysioBoo.Application.Commands.Medicines.UpdateMedicine;
using PhysioBoo.Application.ViewModels.Medicines;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineEndpoints
    {
        public static void MapMedicineEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medicines")
                .WithTags("Medicines")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create medicine
            group.MapPost("/create", async (
                CreateMedicineViewModel newMedicine,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicineCommand(newMedicine));

                return Results.Created($"/api/medicines/{newMedicine.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicine.Id
                });
            }).WithName("CreateMedicine")
            .WithSummary("Create new medicine")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineCreate);

            // Update medicine
            group.MapPatch("/{id:guid}", async (
                Guid id,
                UpdateMedicineViewModel medicine,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicineCommand(medicine, id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateMedicine")
            .WithSummary("Update an existing medicine")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineUpdate);

            // Delete medicine
            group.MapDelete("/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicineCommand(id));

                return Results.NoContent();
            }).WithName("DeleteMedicine")
            .WithSummary("Delete a medicine")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.MedicineDelete);
        }
    }
}
