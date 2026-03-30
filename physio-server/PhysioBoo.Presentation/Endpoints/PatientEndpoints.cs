using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientEndpoints
    {
        public static void MapPatientEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/patients")
                .WithTags("Patients")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create patient
            group.MapPost("/create", async (
                CreatePatientViewModel newPatient,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreatePatientCommand(newPatient));

                return Results.Created($"/api/patients/create", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = "A new patient has been created successfully."
                });
            }).WithName("CreatePatient")
            .WithSummary("Create new patient")
            .Produces<ResponseMessage<string>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
