using MediatR;
using PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification;
using PhysioBoo.Application.ViewModels.DoctorCertifications;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorCertificationEndpoints
    {
        public static void MapDoctorCertificationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-certifications")
                .WithTags("Doctor Certifications")
                .WithOpenApi();

            // Create doctor certification
            group.MapPost("/create", async (
                CreateDoctorCertificationViewModel newDoctorCertification,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorCertificationCommand(newDoctorCertification));

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

                return Results.Created($"/api/doctor-certifications/{newDoctorCertification.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorCertification.Id
                });
            }).WithName("CreateDoctorCertification")
            .WithSummary("Create new doctor certification")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
