using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using PhysioBoo.Application.Queries.RevenueReports.GetSummary;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.Export
{
    /// <summary>
    /// Builds an .xlsx workbook with a Summary sheet and a Transactions sheet for the filtered period.
    /// </summary>
    public sealed class ExportRevenueReportQueryHandler : IRequestHandler<ExportRevenueReportQuery, RevenueReportExportFile>
    {
        private const int MaxRows = 10000;

        private readonly IBillRepository _billRepository;
        private readonly IMediator _mediator;

        public ExportRevenueReportQueryHandler(IBillRepository billRepository, IMediator mediator)
        {
            _billRepository = billRepository;
            _mediator = mediator;
        }

        public async Task<RevenueReportExportFile> Handle(ExportRevenueReportQuery request, CancellationToken ct)
        {
            RevenueReportFilter filter = request.Filter;
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);

            RevenueSummaryViewModel summary = await _mediator.Send(new GetRevenueSummaryQuery(filter), ct);

            List<Bill> bills = await RevenueReportScope
                .BillsIn(_billRepository.GetAllNoTracking(includeProperties: RevenueReportScope.BillIncludes), filter, from, to)
                .OrderByDescending(b => b.BillDate)
                .ThenByDescending(b => b.BillTime)
                .Take(MaxRows)
                .AsSplitQuery()
                .ToListAsync(ct);

            using ExcelPackage package = new ExcelPackage();

            ExcelWorksheet summarySheet = package.Workbook.Worksheets.Add("Summary");
            (string Label, object Value)[] summaryRows =
            {
                ("Period", $"{from:yyyy-MM-dd} → {to:yyyy-MM-dd}"),
                ("Total revenue", summary.TotalRevenue),
                ("Growth vs previous period (%)", summary.TotalRevenueGrowthPct),
                ("Net revenue", summary.NetRevenue),
                ("Total refunds", summary.TotalRefunds),
                ("Total discounts", summary.TotalDiscounts),
                ("Insurance revenue", summary.InsuranceRevenue),
                ("Outstanding", summary.OutstandingRevenue),
                ("Patients", summary.TotalPatients),
                ("Transactions", summary.TotalTransactions),
                ("Average bill value", summary.AverageBillValue)
            };

            for (int i = 0; i < summaryRows.Length; i++)
            {
                summarySheet.Cells[i + 1, 1].Value = summaryRows[i].Label;
                summarySheet.Cells[i + 1, 2].Value = summaryRows[i].Value;
            }
            summarySheet.Column(1).Style.Font.Bold = true;
            summarySheet.Column(2).Style.Numberformat.Format = "#,##0.##";

            ExcelWorksheet txSheet = package.Workbook.Worksheets.Add("Transactions");
            string[] headers = { "Bill No", "Date", "Patient", "Department", "Doctor", "Payment Method", "Amount", "Discount", "Refund", "Status" };
            for (int c = 0; c < headers.Length; c++)
            {
                txSheet.Cells[1, c + 1].Value = headers[c];
            }
            txSheet.Row(1).Style.Font.Bold = true;

            int row = 2;
            foreach (RevenueTransactionViewModel tx in bills.Select(RevenueReportScope.ToTransaction))
            {
                txSheet.Cells[row, 1].Value = tx.BillNo;
                txSheet.Cells[row, 2].Value = tx.Datetime;
                txSheet.Cells[row, 3].Value = tx.PatientName;
                txSheet.Cells[row, 4].Value = tx.Department;
                txSheet.Cells[row, 5].Value = tx.DoctorName;
                txSheet.Cells[row, 6].Value = tx.PaymentMethod;
                txSheet.Cells[row, 7].Value = tx.Amount;
                txSheet.Cells[row, 8].Value = tx.Discount;
                txSheet.Cells[row, 9].Value = tx.Refund;
                txSheet.Cells[row, 10].Value = tx.Status;
                row++;
            }
            txSheet.Column(2).Style.Numberformat.Format = "yyyy-mm-dd hh:mm";
            txSheet.Cells[2, 7, Math.Max(2, row), 9].Style.Numberformat.Format = "#,##0.##";

            summarySheet.Cells[summarySheet.Dimension.Address].AutoFitColumns();
            if (txSheet.Dimension != null) txSheet.Cells[txSheet.Dimension.Address].AutoFitColumns();

            return new RevenueReportExportFile
            {
                Content = await package.GetAsByteArrayAsync(ct),
                FileName = $"revenue-report_{from:yyyyMMdd}-{to:yyyyMMdd}.xlsx"
            };
        }
    }
}
