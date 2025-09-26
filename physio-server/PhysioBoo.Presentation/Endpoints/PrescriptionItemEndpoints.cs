using MediatR;
using PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem;
using PhysioBoo.Application.ViewModels.PrescriptionItems;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrescriptionItemEndpoints
    {
        public static void MapPrescriptionItemEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/prescription-items")
                .WithTags("Prescription Items")
                .WithOpenApi();

            // Create prescription item
            group.MapPost("/create", async (
                CreatePrescriptionItemViewModel newPrescriptionItem,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePrescriptionItemCommand(newPrescriptionItem));

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

                return Results.Created($"/api/prescription-items/{newPrescriptionItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPrescriptionItem.Id
                });
            }).WithName("CreatePrescriptionItem")
            .WithSummary("Create new prescription item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
