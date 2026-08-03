using PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem;
using PhysioBoo.Application.ViewModels.LabOrderItems;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabOrderItemEndpoints
    {
        public static void MapLabOrderItemEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-order-items")
                .WithTags("Lab Order Items")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create lab order item
            group.MapPost("/create", async (
                CreateLabOrderItemViewModel newLabOrderItem,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabOrderItemCommand(newLabOrderItem));

                return Results.Created($"/api/lab-order-items/{newLabOrderItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabOrderItem.Id
                });
            }).WithName("CreateLabOrderItem")
            .WithSummary("Create new lab order item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabOrderItemCreate);
        }
    }
}
