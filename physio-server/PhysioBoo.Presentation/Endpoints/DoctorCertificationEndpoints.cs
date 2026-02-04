using PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification;
using PhysioBoo.Application.ViewModels.DoctorCertifications;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorCertificationEndpoints
    {
        public static void MapDoctorCertificationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-certifications")
                .WithTags("Doctor Certifications")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor certification
            group.MapPost("/create", async (
                CreateDoctorCertificationViewModel newDoctorCertification,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorCertificationCommand(newDoctorCertification));

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
