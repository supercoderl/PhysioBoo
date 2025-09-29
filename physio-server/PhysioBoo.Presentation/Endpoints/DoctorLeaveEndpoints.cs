using MediatR;
using PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave;
using PhysioBoo.Application.ViewModels.DoctorLeaves;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorLeaveEndpoints
    {
        public static void MapDoctorLeaveEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-leaves")
                .WithTags("Doctor Leaves")
                .WithOpenApi();

            // Create doctor leave
            group.MapPost("/create", async (
                CreateDoctorLeaveViewModel newDoctorLeave,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorLeaveCommand(newDoctorLeave));

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

                return Results.Created($"/api/doctor-leaves/{newDoctorLeave.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorLeave.Id
                });
            }).WithName("CreateDoctorLeave")
            .WithSummary("Create new doctor leave")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
