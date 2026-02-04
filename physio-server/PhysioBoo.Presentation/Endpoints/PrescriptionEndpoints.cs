using PhysioBoo.Application.Commands.Prescriptions.CreatePrescription;
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrescriptionEndpoints
    {
        public static void MapPrescriptionEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/prescriptions")
                .WithTags("Prescription")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create prescription
            group.MapPost("/create", async (
                CreatePrescriptionViewModel newPrescription,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreatePrescriptionCommand(newPrescription));

                return Results.Created($"/api/prescriptions/{newPrescription.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPrescription.Id
                });
            }).WithName("CreatePrescription")
            .WithSummary("Create new prescription")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
