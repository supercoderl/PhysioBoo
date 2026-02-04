using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicalRecordEndpoints
    {
        public static void MapMedicalRecordEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medical-records")
                .WithTags("Medical Records")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create medical record
            group.MapPost("/create", async (
                CreateMedicalRecordViewModel newMedicalRecord,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicalRecordCommand(newMedicalRecord, user.GetUserId()));

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
