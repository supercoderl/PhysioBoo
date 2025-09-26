using MediatR;
using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.ViewModels.Medicines;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineEndpoints
    {
        public static void MapMedicineEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/medicines")
                .WithTags("Medicines")
                .WithOpenApi();

            // Create medicine
            group.MapPost("/create", async (
                CreateMedicineViewModel newMedicine,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateMedicineCommand(newMedicine));

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

                return Results.Created($"/api/medicines/{newMedicine.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicine.Id
                });
            }).WithName("CreateMedicine")
            .WithSummary("Create new medicine")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
