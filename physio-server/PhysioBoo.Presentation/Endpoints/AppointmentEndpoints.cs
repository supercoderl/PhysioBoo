using Microsoft.AspNetCore.Mvc;
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

            #region Create New Appointment
            group.MapPost("", async (
                [FromBody] CreateAppointmentViewModel newAppointment,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateAppointmentCommand(newAppointment, newId));

                return Results.CreatedAtRoute(
                    "GetAppointmentById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAppointment")
            .WithSummary("Create new appointment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
