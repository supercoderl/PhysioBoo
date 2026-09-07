
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.ViewModels.Bills;





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

            #region Create New Bill
            group.MapPost("", async (
                [FromBody] CreateBillViewModel newBill,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateBillCommand(newBill, newId));

                // Was Results.CreatedAtRoute("GetBillById", ...) — that named route never existed
                // anywhere in the app, so the Location header generation silently failed. Use a
                // plain URL instead; the real single-bill read path is
                // GET /api/cashier/invoices/{id} (CashierEndpoints.cs), not a route on this group.
                return Results.Created($"/api/bills/{newId}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newBill.Id
                });
            }).WithName("CreateBill")
            .WithSummary("Create new bill")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Billing.BillCreate);
            #endregion
        }
    }
}
