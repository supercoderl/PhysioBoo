using PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy;
using PhysioBoo.Application.ViewModels.PatientAllergies;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientAllergyEndpoints
    {
        public static void MapPatientAllergyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/patientAllergies")
                .WithTags("PatientAllergies")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create patient allergy
            group.MapPost("/create", async (
                CreatePatientAllergyViewModel newPatientAllergy,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreatePatientAllergyCommand(newPatientAllergy));

                return Results.Created($"/api/patientAllergies/{newPatientAllergy.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPatientAllergy.Id
                });
            }).WithName("CreatePatientAllergy")
            .WithSummary("Create new patient allergy")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
