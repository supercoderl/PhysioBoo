using PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory;
using PhysioBoo.Application.ViewModels.PatientMedicalHistories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientMedicalHistoryEndpoints
    {
        public static void MapPatientMedicalHistoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/patient-medical-histories")
                .WithTags("Patient Medical Histories")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create patient medical history
            group.MapPost("/create", async (
                CreatePatientMedicalHistoryViewModel newPatientMedicalHistory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreatePatientMedicalHistoryCommand(newPatientMedicalHistory));

                return Results.Created($"/api/patient-medical-histories/{newPatientMedicalHistory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPatientMedicalHistory.Id
                });
            }).WithName("CreatePatientMedicalHistory")
            .WithSummary("Create new patient medical history")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
