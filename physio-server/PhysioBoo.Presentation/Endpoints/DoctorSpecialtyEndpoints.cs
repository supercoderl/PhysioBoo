using PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty;
using PhysioBoo.Application.ViewModels.DoctorSpecialties;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorSpecialtyEndpoints
    {
        public static void MapDoctorSpecialtyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-specialties")
                .WithTags("Doctor Specialties")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor specialty
            group.MapPost("/create", async (
                CreateDoctorSpecialtyViewModel newDoctorSpecialty,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorSpecialtyCommand(newDoctorSpecialty));

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
