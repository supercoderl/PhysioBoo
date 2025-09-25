using MediatR;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentTypeEndpoints
    {
        public static void MapAppointmentTypeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/appointment-types")
                .WithTags("Appointment Types")
                .WithOpenApi();

            // Create appointment type
            group.MapPost("/create", async (
                CreateAppointmentTypeViewModel newAppointmentType,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateAppointmentTypeCommand(newAppointmentType));

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

                return Results.Created($"/api/appointment-types/{newAppointmentType.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newAppointmentType.Id
                });
            }).WithName("CreateAppointmentType")
            .WithSummary("Create new appointment type")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
