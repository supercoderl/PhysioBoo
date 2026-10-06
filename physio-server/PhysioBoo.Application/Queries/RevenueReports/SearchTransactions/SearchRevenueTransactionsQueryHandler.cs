using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchTransactions
{
    public sealed class SearchRevenueTransactionsQueryHandler : IRequestHandler<SearchRevenueTransactionsQuery, PagedResult<RevenueTransactionViewModel>>
    {
        private readonly IBillRepository _billRepository;

        public SearchRevenueTransactionsQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<PagedResult<RevenueTransactionViewModel>> Handle(SearchRevenueTransactionsQuery q, CancellationToken ct)
        {
            RevenueReportFilter filter = RevenueReportScope.OrDefault(q.Request.Filter);
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (int pageNumber, int pageSize) = RevenueReportScope.Page(q.Request);

            IQueryable<Bill> query = RevenueReportScope.BillsIn(
                _billRepository.GetAllNoTracking(includeProperties: RevenueReportScope.BillIncludes),
                filter, from, to
            );

            int totalCount = await query.CountAsync(ct);

            List<Bill> bills = await query
                .OrderByDescending(b => b.BillDate)
                .ThenByDescending(b => b.BillTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            return new PagedResult<RevenueTransactionViewModel>(
                totalCount,
                bills.Select(RevenueReportScope.ToTransaction).ToList(),
                pageNumber,
                pageSize
            );
        }
    }
}
