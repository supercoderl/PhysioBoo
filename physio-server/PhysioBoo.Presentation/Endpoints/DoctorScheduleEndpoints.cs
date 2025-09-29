using MediatR;
using PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule;
using PhysioBoo.Application.ViewModels.DoctorSchedules;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorScheduleEndpoints
    {
        public static void MapDoctorScheduleEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-schedules")
                .WithTags("Doctor Schedules")
                .WithOpenApi();

            // Create doctor schedule
            group.MapPost("/create", async (
                CreateDoctorScheduleViewModel newDoctorSchedule,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorScheduleCommand(newDoctorSchedule));

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

                return Results.Created($"/api/doctor-schedules/{newDoctorSchedule.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorSchedule.Id
                });
            }).WithName("CreateDoctorSchedule")
            .WithSummary("Create new doctor schedule")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
