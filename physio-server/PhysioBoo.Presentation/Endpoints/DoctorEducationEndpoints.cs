using PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation;
using PhysioBoo.Application.ViewModels.DoctorEducations;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorEducationEndpoints
    {
        public static void MapDoctorEducationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-educations")
                .WithTags("Doctor Educations")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor education
            group.MapPost("/create", async (
                CreateDoctorEducationViewModel newDoctorEducation,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorEducationCommand(newDoctorEducation));

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
