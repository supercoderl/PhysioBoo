using MediatR;
using PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience;
using PhysioBoo.Application.ViewModels.DoctorWorkExperiences;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorWorkExperienceEndpoints
    {
        public static void MapDoctorWorkExperienceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-work-experiences")
                .WithTags("Doctor Work Experiences")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor work experience
            group.MapPost("/create", async (
                CreateDoctorWorkExperienceViewModel newDoctorWorkExperience,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorWorkExperienceCommand(newDoctorWorkExperience));

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
