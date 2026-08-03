using PhysioBoo.Application.Commands.LabOrders.CreateLabOrder;
using PhysioBoo.Application.ViewModels.LabOrders;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabOrderEndpoints
    {
        public static void MapLabOrderEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-orders")
                .WithTags("Lab Orders")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create lab order
            group.MapPost("/create", async (
                CreateLabOrderViewModel newLabOrder,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabOrderCommand(newLabOrder));

                return Results.Created($"/api/lab-orders/{newLabOrder.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabOrder.Id
                });
            }).WithName("CreateLabOrder")
            .WithSummary("Create new lab order")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabOrderCreate);
        }
    }
}
