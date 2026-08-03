using PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem;
using PhysioBoo.Application.ViewModels.PrescriptionItems;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrescriptionItemEndpoints
    {
        public static void MapPrescriptionItemEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/prescription-items")
                .WithTags("Prescription Items")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create prescription item
            group.MapPost("/create", async (
                CreatePrescriptionItemViewModel newPrescriptionItem,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreatePrescriptionItemCommand(newPrescriptionItem));

                return Results.Created($"/api/prescription-items/{newPrescriptionItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPrescriptionItem.Id
                });
            }).WithName("CreatePrescriptionItem")
            .WithSummary("Create new prescription item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionItemCreate);
        }
    }
}
