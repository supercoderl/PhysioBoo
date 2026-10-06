using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchDiscounts
{
    public sealed class SearchDiscountsQueryHandler : IRequestHandler<SearchDiscountsQuery, PagedResult<DiscountRecordViewModel>>
    {
        private readonly IBillRepository _billRepository;

        public SearchDiscountsQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<PagedResult<DiscountRecordViewModel>> Handle(SearchDiscountsQuery q, CancellationToken ct)
        {
            RevenueReportFilter filter = RevenueReportScope.OrDefault(q.Request.Filter);
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (int pageNumber, int pageSize) = RevenueReportScope.Page(q.Request);

            IQueryable<Bill> query = RevenueReportScope
                .BillsIn(_billRepository.GetAllNoTracking(includeProperties: "Patient.Profile,Department,Approver.Profile"), filter, from, to)
                .Where(b => b.DiscountAmount > 0);

            int totalCount = await query.CountAsync(ct);

            List<Bill> bills = await query
                .OrderByDescending(b => b.BillDate)
                .ThenByDescending(b => b.BillTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<DiscountRecordViewModel> items = bills.Select(b => new DiscountRecordViewModel
            {
                DiscountId = b.Id,
                BillNo = b.BillNumber,
                PatientName = RevenueReportScope.PatientName(b),
                Department = b.Department?.Name ?? string.Empty,
                // Bills only store the discount amount, so describe it as a share of the subtotal.
                DiscountType = b.Subtotal > 0 ? $"{Math.Round(b.DiscountAmount / b.Subtotal * 100, 1)}% of subtotal" : "Fixed",
                Amount = b.DiscountAmount,
                ApprovedBy = b.Approver?.Profile?.FullName ?? string.Empty,
                Date = b.BillDate
            }).ToList();

            return new PagedResult<DiscountRecordViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
