using MediatR;
using PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory;
using PhysioBoo.Application.ViewModels.PatientMedicalHistories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientMedicalHistoryEndpoints
    {
        public static void MapPatientMedicalHistoryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/patient-medical-histories")
                .WithTags("Patient Medical Histories")
                .WithOpenApi();

            // Create patient medical history
            group.MapPost("/create", async (
                CreatePatientMedicalHistoryViewModel newPatientMedicalHistory,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePatientMedicalHistoryCommand(newPatientMedicalHistory));

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
