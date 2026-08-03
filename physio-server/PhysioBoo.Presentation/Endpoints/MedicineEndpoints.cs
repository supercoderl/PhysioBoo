using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.ViewModels.Medicines;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

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
        }
    }
}
