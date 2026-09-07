using PhysioBoo.Application.Commands.Cashier.ApplyDiscount;
using PhysioBoo.Application.Commands.Cashier.ApplyInsurance;
using PhysioBoo.Application.Commands.Cashier.ReceivePayment;
using PhysioBoo.Application.Commands.Cashier.RefundPayment;
using PhysioBoo.Application.Commands.Cashier.VoidInvoice;
using PhysioBoo.Application.Queries.Cashier.GetDashboardStats;
using PhysioBoo.Application.Queries.Cashier.GetInvoiceById;
using PhysioBoo.Application.Queries.Cashier.GetPaymentHistory;
using PhysioBoo.Application.Queries.Cashier.SearchInvoices;
using PhysioBoo.Application.ViewModels.Cashier;






namespace PhysioBoo.Presentation.Endpoints
{
    public static class CashierEndpoints
    {
        public static void MapCashierEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/cashier")
                .WithTags("Cashier")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // 12.1 Dashboard
            group.MapGet("/dashboard", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CashierDashboardStatsViewModel result = await bus.QueryAsync(new GetCashierDashboardStatsQuery());
                return Results.Ok(new ResponseMessage<CashierDashboardStatsViewModel> { Success = true, Data = result });
            }).WithName("GetCashierDashboard")
            .Produces<ResponseMessage<CashierDashboardStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillRead);

            // 12.2 Search invoices
            group.MapGet("/invoices", async (
                string? search,
                int pageNumber,
                int pageSize,
                string? status,
                DateOnly? dateFrom,
                DateOnly? dateTo,
                Guid? departmentId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedRequest<CashierInvoiceFilter> request = new PagedRequest<CashierInvoiceFilter>
                {
                    Search = search,
                    PageNumber = pageNumber <= 0 ? 1 : pageNumber,
                    PageSize = pageSize <= 0 ? 20 : pageSize,
                    Filter = new CashierInvoiceFilter { Status = status, DateFrom = dateFrom, DateTo = dateTo, DepartmentId = departmentId }
                };

                PagedResult<CashierInvoiceViewModel> result = await bus.QueryAsync(new SearchInvoicesQuery(request));
                return Results.Ok(new ResponseMessage<PagedResult<CashierInvoiceViewModel>> { Success = true, Data = result });
            }).WithName("SearchCashierInvoices")
            .Produces<ResponseMessage<PagedResult<CashierInvoiceViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillRead);

            // 12.3 Invoice detail
            group.MapGet("/invoices/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(id));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("GetCashierInvoiceDetail")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillRead);

            // 12.5 Apply discount
            group.MapPost("/invoices/{id:guid}/discounts", async (
                Guid id,
                ApplyDiscountViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ApplyDiscountCommand(id, body));
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(id));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("ApplyCashierDiscount")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillDiscountApply);

            // 12.6 Apply insurance
            group.MapPost("/invoices/{id:guid}/insurance", async (
                Guid id,
                ApplyInsuranceViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ApplyInsuranceCommand(id, body));
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(id));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("ApplyCashierInsurance")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillInsuranceApply);

            // 12.7 Receive payment
            group.MapPost("/payments", async (
                ReceivePaymentViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ReceivePaymentCommand(body));
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(body.InvoiceId));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("ReceiveCashierPayment")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.PaymentCreate);

            // 12.8 Refund
            group.MapPost("/refunds", async (
                RefundPaymentViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RefundPaymentCommand(body));
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(body.InvoiceId));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("RefundCashierPayment")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.PaymentRefund);

            // 12.9 Void
            group.MapPost("/invoices/{id:guid}/void", async (
                Guid id,
                VoidInvoiceViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new VoidInvoiceCommand(id, body));
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(id));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("VoidCashierInvoice")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillVoid);

            // 12.10 Payment history / transactions timeline
            group.MapGet("/payment-history", async (
                int limit,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<CashierTransactionEventViewModel> result = await bus.QueryAsync(new GetPaymentHistoryQuery(limit));
                return Results.Ok(new ResponseMessage<List<CashierTransactionEventViewModel>> { Success = true, Data = result });
            }).WithName("GetCashierPaymentHistory")
            .Produces<ResponseMessage<List<CashierTransactionEventViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.PaymentRead);

            // 12.11 Print — JSON representation for this pass, same simplification precedent as
            // Retail/Stock Take (no PDF renderer wired up yet).
            group.MapPost("/print-invoice", async (
                PrintInvoiceRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CashierInvoiceViewModel? result = await bus.QueryAsync(new GetInvoiceByIdQuery(body.InvoiceId));
                return Results.Ok(new ResponseMessage<CashierInvoiceViewModel?> { Success = true, Data = result });
            }).WithName("PrintCashierInvoice")
            .Produces<ResponseMessage<CashierInvoiceViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Billing.BillRead);
        }

        public sealed record PrintInvoiceRequestBody(Guid InvoiceId);
    }
}
