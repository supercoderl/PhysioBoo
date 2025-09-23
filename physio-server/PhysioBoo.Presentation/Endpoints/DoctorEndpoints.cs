using MediatR;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorEndpoints
    {
        public static void MapDoctorEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/doctors")
                .WithTags("Doctors")
                .WithOpenApi();

            // Create doctor
            group.MapPost("/create", async (
                CreateDoctorViewModel newDoctor,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                var id = user.GetUserId();

                await bus.SendCommandAsync(new CreateDoctorCommand(id, newDoctor));

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

                return Results.Created($"/api/doctors/create/{id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("CreateDoctor")
            .WithSummary("Create new doctor information")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
