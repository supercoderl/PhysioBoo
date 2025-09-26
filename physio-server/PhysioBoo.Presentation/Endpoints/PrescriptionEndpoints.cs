using MediatR;
using PhysioBoo.Application.Commands.Prescriptions.CreatePrescription;
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrescriptionEndpoints
    {
        public static void MapPrescriptionEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/prescriptions")
                .WithTags("Prescription")
                .WithOpenApi();

            // Create prescription
            group.MapPost("/create", async (
                CreatePrescriptionViewModel newPrescription,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePrescriptionCommand(newPrescription));

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

                return Results.Created($"/api/prescriptions/{newPrescription.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPrescription.Id
                });
            }).WithName("CreatePrescription")
            .WithSummary("Create new prescription")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
