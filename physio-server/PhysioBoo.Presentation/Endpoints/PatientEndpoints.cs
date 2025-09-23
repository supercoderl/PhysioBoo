using MediatR;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientEndpoints
    {
        public static void MapPatientEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/patients")
                .WithTags("Patients")
                .WithOpenApi();

            // Create patient
            group.MapPost("/create", async (
                CreatePatientViewModel newPatient,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                var id = user.GetUserId();

                await bus.SendCommandAsync(new CreatePatientCommand(id, newPatient));

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

                return Results.Created($"/api/patients/create/{id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("CreatePatient")
            .WithSummary("Create new patient")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
