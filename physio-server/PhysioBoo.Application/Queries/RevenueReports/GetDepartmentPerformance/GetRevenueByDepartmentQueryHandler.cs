using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetDepartmentPerformance
{
    public sealed class GetRevenueByDepartmentQueryHandler : IRequestHandler<GetRevenueByDepartmentQuery, List<DepartmentRevenuePerformanceViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetRevenueByDepartmentQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<List<DepartmentRevenuePerformanceViewModel>> Handle(GetRevenueByDepartmentQuery request, CancellationToken ct)
        {
            RevenueReportFilter filter = request.Filter;
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (DateOnly prevFrom, DateOnly prevTo) = RevenueReportScope.PreviousRange(filter);

            var current = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, from, to)
                .Where(p => p.Bill != null)
                .Select(p => new
                {
                    p.Amount,
                    p.PatientId,
                    p.BillId,
                    DepartmentId = p.Bill!.DepartmentId,
                    DepartmentName = p.Bill.Department != null ? p.Bill.Department.Name : null
                })
                .ToListAsync(ct);

            Dictionary<Guid, decimal> previous = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, prevFrom, prevTo)
                .Where(p => p.Bill != null)
                .GroupBy(p => p.Bill!.DepartmentId)
                .Select(g => new { DepartmentId = g.Key, Amount = g.Sum(p => p.Amount) })
                .ToDictionaryAsync(x => x.DepartmentId, x => x.Amount, ct);

            decimal total = current.Sum(p => p.Amount);

            return current
                .GroupBy(p => p.DepartmentId)
                .Select(g =>
                {
                    decimal revenue = g.Sum(p => p.Amount);
                    return new DepartmentRevenuePerformanceViewModel
                    {
                        DepartmentId = g.Key,
                        Name = g.First().DepartmentName ?? "Unassigned",
                        Revenue = revenue,
                        Patients = g.Select(p => p.PatientId).Distinct().Count(),
                        Transactions = g.Select(p => p.BillId).Distinct().Count(),
                        Percentage = total == 0 ? 0 : Math.Round((double)(revenue / total * 100), 1),
                        GrowthPct = RevenueReportScope.GrowthPct(revenue, previous.GetValueOrDefault(g.Key))
                    };
                })
                .OrderByDescending(d => d.Revenue)
                .ToList();
        }
    }
}
