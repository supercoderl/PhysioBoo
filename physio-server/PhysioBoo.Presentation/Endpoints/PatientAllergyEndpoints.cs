using MediatR;
using PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy;
using PhysioBoo.Application.ViewModels.PatientAllergies;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientAllergyEndpoints
    {
        public static void MapPatientAllergyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/patientAllergies")
                .WithTags("PatientAllergies")
                .WithOpenApi();

            // Create patient allergy
            group.MapPost("/create", async (
                CreatePatientAllergyViewModel newPatientAllergy,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePatientAllergyCommand(newPatientAllergy));

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
