using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.ViewModels.Bills;
using PhysioBoo.Domain.Constants;
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

            #region Create New Bill
            group.MapPost("", async (
                [FromBody] CreateBillViewModel newBill,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateBillCommand(newBill, newId));

                return Results.CreatedAtRoute(
                    "GetBillById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newBill.Id
                    }
                );
            }).WithName("CreateBill")
            .WithSummary("Create new bill")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Billing.BillCreate);
            #endregion
        }
    }
}
