using MediatR;
using PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation;
using PhysioBoo.Application.ViewModels.DoctorEducations;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorEducationEndpoints
    {
        public static void MapDoctorEducationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-educations")
                .WithTags("Doctor Educations")
                .WithOpenApi();

            // Create doctor education
            group.MapPost("/create", async (
                CreateDoctorEducationViewModel newDoctorEducation,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorEducationCommand(newDoctorEducation));

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

                return Results.Created($"/api/doctor-educations/{newDoctorEducation.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorEducation.Id
                });
            }).WithName("CreateDoctorEducation")
            .WithSummary("Create new doctor education")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
