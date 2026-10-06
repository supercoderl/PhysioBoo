using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchOutstanding
{
    public sealed class SearchOutstandingInvoicesQueryHandler : IRequestHandler<SearchOutstandingInvoicesQuery, PagedResult<OutstandingInvoiceViewModel>>
    {
        private readonly IBillRepository _billRepository;

        public SearchOutstandingInvoicesQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<PagedResult<OutstandingInvoiceViewModel>> Handle(SearchOutstandingInvoicesQuery q, CancellationToken ct)
        {
            RevenueReportFilter filter = RevenueReportScope.OrDefault(q.Request.Filter);
            (int pageNumber, int pageSize) = RevenueReportScope.Page(q.Request);

            IQueryable<Bill> query = RevenueReportScope.OutstandingBills(
                _billRepository.GetAllNoTracking(includeProperties: "Patient.Profile,Department"),
                filter
            );

            int totalCount = await query.CountAsync(ct);

            // Oldest debt first.
            List<Bill> bills = await query
                .OrderBy(b => b.DueDate ?? b.BillDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<OutstandingInvoiceViewModel> items = bills.Select(b =>
            {
                int days = RevenueReportScope.DaysOverdue(b.DueDate, b.BillDate);
                return new OutstandingInvoiceViewModel
                {
                    InvoiceId = b.Id,
                    BillNo = b.BillNumber,
                    PatientName = RevenueReportScope.PatientName(b),
                    Department = b.Department?.Name ?? string.Empty,
                    DueDate = b.DueDate,
                    AmountDue = b.OutstandingAmount,
                    AgingBucket = RevenueReportScope.AgingBucket(days),
                    DaysOverdue = days
                };
            }).ToList();

            return new PagedResult<OutstandingInvoiceViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
