using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentEndpoints
    {
        public static void MapAppointmentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/appointments")
                .WithTags("Appointments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create appointment
            group.MapPost("/create", async (
                CreateAppointmentViewModel newAppointment,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateAppointmentCommand(newAppointment, user.IsAuthenticated ? user.GetUserId() : null));

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
