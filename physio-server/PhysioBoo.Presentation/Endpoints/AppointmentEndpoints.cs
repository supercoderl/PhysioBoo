using MediatR;
using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentEndpoints
    {
        public static void MapAppointmentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/appointments")
                .WithTags("Appointments")
                .WithOpenApi();

            // Create appointment
            group.MapPost("/create", async (
                CreateAppointmentViewModel newAppointment,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateAppointmentCommand(newAppointment, user.IsAuthenticated ? user.GetUserId() : null));

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

                return Results.Created($"/api/appointments/{newAppointment.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newAppointment.Id
                });
            }).WithName("CreateAppointment")
            .WithSummary("Create new appointment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
