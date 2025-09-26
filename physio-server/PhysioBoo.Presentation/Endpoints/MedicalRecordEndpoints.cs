using MediatR;
using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicalRecordEndpoints
    {
        public static void MapMedicalRecordEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/medical-records")
                .WithTags("Medical Records")
                .WithOpenApi();

            // Create medical record
            group.MapPost("/create", async (
                CreateMedicalRecordViewModel newMedicalRecord,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateMedicalRecordCommand(newMedicalRecord, user.GetUserId()));

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

                return Results.Created($"/api/medical-records/{newMedicalRecord.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicalRecord.Id
                });
            }).WithName("CreateMedicalRecord")
            .WithSummary("Create new medical record")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
