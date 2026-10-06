using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetOutstandingSummary
{
    public sealed class GetOutstandingSummaryQueryHandler : IRequestHandler<GetOutstandingSummaryQuery, List<OutstandingAgingSummaryViewModel>>
    {
        private static readonly string[] s_buckets = { "0-30", "31-60", "61-90", "90+" };

        private readonly IBillRepository _billRepository;

        public GetOutstandingSummaryQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<List<OutstandingAgingSummaryViewModel>> Handle(GetOutstandingSummaryQuery request, CancellationToken ct)
        {
            var bills = await RevenueReportScope
                .OutstandingBills(_billRepository.GetAllNoTracking(), request.Filter)
                .Select(b => new { b.DueDate, b.BillDate, b.OutstandingAmount })
                .ToListAsync(ct);

            var grouped = bills
                .GroupBy(b => RevenueReportScope.AgingBucket(RevenueReportScope.DaysOverdue(b.DueDate, b.BillDate)))
                .ToDictionary(g => g.Key, g => (Amount: g.Sum(b => b.OutstandingAmount), Count: g.Count()));

            return s_buckets.Select(bucket => new OutstandingAgingSummaryViewModel
            {
                Bucket = bucket,
                Amount = grouped.TryGetValue(bucket, out var v) ? v.Amount : 0,
                Count = grouped.TryGetValue(bucket, out var c) ? c.Count : 0
            }).ToList();
        }
    }
}
