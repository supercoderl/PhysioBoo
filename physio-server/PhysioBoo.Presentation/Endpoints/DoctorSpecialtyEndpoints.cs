using MediatR;
using PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty;
using PhysioBoo.Application.ViewModels.DoctorSpecialties;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorSpecialtyEndpoints
    {
        public static void MapDoctorSpecialtyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-specialties")
                .WithTags("Doctor Specialties")
                .WithOpenApi();

            // Create doctor specialty
            group.MapPost("/create", async (
                CreateDoctorSpecialtyViewModel newDoctorSpecialty,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorSpecialtyCommand(newDoctorSpecialty));

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

                return Results.Created($"/api/doctor-specialties/{newDoctorSpecialty.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorSpecialty.Id
                });
            }).WithName("CreateDoctorSpecialty")
            .WithSummary("Create new doctor specialty")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
