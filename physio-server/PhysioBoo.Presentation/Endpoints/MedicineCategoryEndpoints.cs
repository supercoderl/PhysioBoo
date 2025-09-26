using MediatR;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineCategoryEndpoints
    {
        public static void MapMedicineCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/medicine-categories")
                .WithTags("Medicine Categories")
                .WithOpenApi();

            // Create medicine category
            group.MapPost("/create", async (
                CreateMedicineCategoryViewModel newMedicineCategory,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateMedicineCategoryCommand(newMedicineCategory));

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
