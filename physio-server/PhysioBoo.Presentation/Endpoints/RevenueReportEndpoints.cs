using PhysioBoo.Application.Queries.RevenueReports.Export;
using PhysioBoo.Application.Queries.RevenueReports.GetDepartmentPerformance;
using PhysioBoo.Application.Queries.RevenueReports.GetDoctorPerformance;
using PhysioBoo.Application.Queries.RevenueReports.GetInsuranceRevenue;
using PhysioBoo.Application.Queries.RevenueReports.GetOutstandingSummary;
using PhysioBoo.Application.Queries.RevenueReports.GetPaymentMethods;
using PhysioBoo.Application.Queries.RevenueReports.GetSummary;
using PhysioBoo.Application.Queries.RevenueReports.GetTransactionById;
using PhysioBoo.Application.Queries.RevenueReports.GetTrend;
using PhysioBoo.Application.Queries.RevenueReports.SearchDiscounts;
using PhysioBoo.Application.Queries.RevenueReports.SearchOutstanding;
using PhysioBoo.Application.Queries.RevenueReports.SearchRefunds;
using PhysioBoo.Application.Queries.RevenueReports.SearchTransactions;
using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class RevenueReportEndpoints
    {
        public static void MapRevenueReportEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/revenue-report")
                .WithTags("Revenue Report")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>()
                .RequireAuthorization(Permissions.Finance.RevenueReportRead);

            #region Aggregates
            group.MapPost("/summary", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueSummaryQuery(filter))))
            .WithName("GetRevenueSummary")
            .WithSummary("KPI totals for the period, with growth against the previous period of equal length.")
            .Produces<ResponseMessage<RevenueSummaryViewModel>>(StatusCodes.Status200OK);

            group.MapPost("/trend", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueTrendQuery(filter))))
            .WithName("GetRevenueTrend")
            .WithSummary("Collected revenue per day / week / month, split by payment method.")
            .Produces<ResponseMessage<List<RevenueTrendPointViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/payment-methods", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenuePaymentMethodsQuery(filter))))
            .WithName("GetRevenuePaymentMethods")
            .WithSummary("Collected revenue by payment method.")
            .Produces<ResponseMessage<List<PaymentMethodBreakdownViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/departments", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueByDepartmentQuery(filter))))
            .WithName("GetRevenueByDepartment")
            .WithSummary("Revenue performance per department.")
            .Produces<ResponseMessage<List<DepartmentRevenuePerformanceViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/doctors", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueByDoctorQuery(filter))))
            .WithName("GetRevenueByDoctor")
            .WithSummary("Revenue performance per doctor (via the bill's appointment).")
            .Produces<ResponseMessage<List<DoctorRevenuePerformanceViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/insurance", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueByInsuranceQuery(filter))))
            .WithName("GetRevenueByInsurance")
            .WithSummary("Claimed / approved / pending / rejected amounts per insurance provider.")
            .Produces<ResponseMessage<List<InsuranceProviderRevenueViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/outstanding/summary", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetOutstandingSummaryQuery(filter))))
            .WithName("GetOutstandingSummary")
            .WithSummary("Outstanding receivables grouped into aging buckets.")
            .Produces<ResponseMessage<List<OutstandingAgingSummaryViewModel>>>(StatusCodes.Status200OK);
            #endregion

            #region Paged Lists
            group.MapPost("/outstanding/search", async ([FromBody] PagedRequest<RevenueReportFilter> request, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new SearchOutstandingInvoicesQuery(request))))
            .WithName("SearchOutstandingInvoices")
            .WithSummary("Outstanding invoices, oldest debt first.")
            .Produces<ResponseMessage<PagedResult<OutstandingInvoiceViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/refunds/search", async ([FromBody] PagedRequest<RevenueReportFilter> request, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new SearchRefundsQuery(request))))
            .WithName("SearchRevenueRefunds")
            .WithSummary("Refunds issued in the period.")
            .Produces<ResponseMessage<PagedResult<RefundRecordViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/discounts/search", async ([FromBody] PagedRequest<RevenueReportFilter> request, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new SearchDiscountsQuery(request))))
            .WithName("SearchRevenueDiscounts")
            .WithSummary("Discounted bills in the period.")
            .Produces<ResponseMessage<PagedResult<DiscountRecordViewModel>>>(StatusCodes.Status200OK);

            group.MapPost("/transactions/search", async ([FromBody] PagedRequest<RevenueReportFilter> request, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new SearchRevenueTransactionsQuery(request))))
            .WithName("SearchRevenueTransactions")
            .WithSummary("Bills in the period with their payment status.")
            .Produces<ResponseMessage<PagedResult<RevenueTransactionViewModel>>>(StatusCodes.Status200OK);

            group.MapGet("/transactions/{id:guid}", async (Guid id, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetRevenueTransactionByIdQuery(id))))
            .WithName("GetRevenueTransactionById")
            .WithSummary("Bill detail with line items, payment splits and insurance claim.")
            .Produces<ResponseMessage<RevenueTransactionDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<RevenueTransactionDetailViewModel?>>(StatusCodes.Status404NotFound);
            #endregion

            #region Export
            group.MapPost("/export", async ([FromBody] RevenueReportFilter filter, IMediatorHandler bus) =>
            {
                RevenueReportExportFile file = await bus.QueryAsync(new ExportRevenueReportQuery(filter));
                return Results.File(file.Content, file.ContentType, file.FileName);
            })
            .WithName("ExportRevenueReport")
            .WithSummary("Download the report (summary + transactions) as an Excel workbook.")
            .Produces(StatusCodes.Status200OK, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .RequireAuthorization(Permissions.Finance.RevenueReportExport);
            #endregion
        }

        private static IResult Ok<T>(T data)
        {
            return Results.Ok(new ResponseMessage<T>
            {
                Success = true,
                Data = data
            });
        }
    }
}
