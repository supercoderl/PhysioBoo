using PhysioBoo.Application.Commands.BillItems.CreateBillItem;
using PhysioBoo.Application.ViewModels.BillItems;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class BillItemEndpoints
    {
        public static void MapBillItemEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/bill-items")
                .WithTags("Bill Items")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create bill item
            group.MapPost("/create", async (
                CreateBillItemViewModel newBillItem,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateBillItemCommand(newBillItem));

                return Results.Created($"/api/bill-items/{newBillItem.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newBillItem.Id
                });
            }).WithName("CreateBillItem")
            .WithSummary("Create new bill item")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
