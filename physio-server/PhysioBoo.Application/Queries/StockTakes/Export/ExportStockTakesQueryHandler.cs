using OfficeOpenXml;
using PhysioBoo.Application.Queries.StockTakes.Search;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.StockTakes.Export
{
    /// <summary>
    /// Excel export of the stock-take list, using the same filters as the search screen.
    /// </summary>
    public sealed class ExportStockTakesQueryHandler : IRequestHandler<ExportStockTakesQuery, byte[]>
    {
        private const int PageSize = 100;
        private const int MaxPages = 100;

        private readonly IMediator _mediator;

        public ExportStockTakesQueryHandler(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task<byte[]> Handle(ExportStockTakesQuery request, CancellationToken ct)
        {
            List<StockTakeViewModel> rows = new List<StockTakeViewModel>();

            for (int page = 1; page <= MaxPages; page++)
            {
                PagedResult<StockTakeViewModel> result = await _mediator.Send(new SearchStockTakesQuery(new PagedRequest<StockTakeFilter>
                {
                    PageNumber = page,
                    PageSize = PageSize,
                    Search = request.Search,
                    Filter = request.Filter
                }), ct);

                rows.AddRange(result.Items);
                if (!result.HasNext) break;
            }

            using ExcelPackage package = new ExcelPackage();
            ExcelWorksheet sheet = package.Workbook.Worksheets.Add("Stock Takes");

            string[] headers = { "Code", "Warehouse", "Department", "Status", "Scheduled", "Created", "Created By", "Assigned To", "Items", "Completed %", "Difference Value", "Notes" };
            for (int c = 0; c < headers.Length; c++) sheet.Cells[1, c + 1].Value = headers[c];
            sheet.Row(1).Style.Font.Bold = true;

            int row = 2;
            foreach (StockTakeViewModel s in rows)
            {
                sheet.Cells[row, 1].Value = s.Code;
                sheet.Cells[row, 2].Value = s.WarehouseName;
                sheet.Cells[row, 3].Value = s.DepartmentName;
                sheet.Cells[row, 4].Value = s.Status;
                sheet.Cells[row, 5].Value = s.ScheduledDate.ToDateTime(TimeOnly.MinValue);
                sheet.Cells[row, 6].Value = s.CreatedDate;
                sheet.Cells[row, 7].Value = s.CreatedByName;
                sheet.Cells[row, 8].Value = s.AssignedToName;
                sheet.Cells[row, 9].Value = s.ItemsCount;
                sheet.Cells[row, 10].Value = s.CompletedPercent;
                sheet.Cells[row, 11].Value = s.DifferenceValue;
                sheet.Cells[row, 12].Value = s.Notes;
                row++;
            }

            sheet.Column(5).Style.Numberformat.Format = "yyyy-mm-dd";
            sheet.Column(6).Style.Numberformat.Format = "yyyy-mm-dd hh:mm";
            sheet.Column(11).Style.Numberformat.Format = "#,##0.##";
            if (sheet.Dimension != null) sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

            return await package.GetAsByteArrayAsync(ct);
        }
    }
}
