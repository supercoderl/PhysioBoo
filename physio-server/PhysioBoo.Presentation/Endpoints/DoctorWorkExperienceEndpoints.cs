using MediatR;
using PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience;
using PhysioBoo.Application.ViewModels.DoctorWorkExperiences;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorWorkExperienceEndpoints
    {
        public static void MapDoctorWorkExperienceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-work-experiences")
                .WithTags("Doctor Work Experiences")
                .WithOpenApi();

            // Create doctor work experience
            group.MapPost("/create", async (
                CreateDoctorWorkExperienceViewModel newDoctorWorkExperience,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorWorkExperienceCommand(newDoctorWorkExperience));

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

                return Results.Created($"/api/doctor-work-experiences/{newDoctorWorkExperience.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorWorkExperience.Id
                });
            }).WithName("CreateDoctorWorkExperience")
            .WithSummary("Create new doctor work experience")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
