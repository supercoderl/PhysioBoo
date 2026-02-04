using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentTypeEndpoints
    {
        public static void MapAppointmentTypeEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/appointment-types")
                .WithTags("Appointment Types")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create appointment type
            group.MapPost("/create", async (
                CreateAppointmentTypeViewModel newAppointmentType,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateAppointmentTypeCommand(newAppointmentType));

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
