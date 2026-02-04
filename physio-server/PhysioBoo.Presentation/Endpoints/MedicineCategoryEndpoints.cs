using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineCategoryEndpoints
    {
        public static void MapMedicineCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medicine-categories")
                .WithTags("Medicine Categories")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create medicine category
            group.MapPost("/create", async (
                CreateMedicineCategoryViewModel newMedicineCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicineCategoryCommand(newMedicineCategory));

                return Results.Created($"/api/medicine-categories/{newMedicineCategory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicineCategory.Id
                });
            }).WithName("CreateMedicineCategory")
            .WithSummary("Create new medicine category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
