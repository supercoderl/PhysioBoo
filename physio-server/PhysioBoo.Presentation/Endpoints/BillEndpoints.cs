using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.ViewModels.Bills;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class BillEndpoints
    {
        public static void MapBillEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/bills")
                .WithTags("Bills")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create bill
            group.MapPost("/create", async (
                CreateBillViewModel newBill,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateBillCommand(newBill));

                return Results.Created($"/api/bills/{newBill.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newBill.Id
                });
            }).WithName("CreateBill")
            .WithSummary("Create new bill")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
