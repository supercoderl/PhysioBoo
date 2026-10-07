using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Laboratory.GetTrends
{
    public sealed class GetLabTrendsQueryHandler : IRequestHandler<GetLabTrendsQuery, LabDashboardTrendViewModel>
    {
        private const int TrendDays = 7;
        private const int CategoryDays = 30;

        private readonly ILabOrderRepository _labOrderRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;

        public GetLabTrendsQueryHandler(ILabOrderRepository labOrderRepository, ILabOrderItemRepository labOrderItemRepository)
        {
            _labOrderRepository = labOrderRepository;
            _labOrderItemRepository = labOrderItemRepository;
        }

        public async Task<LabDashboardTrendViewModel> Handle(GetLabTrendsQuery request, CancellationToken ct)
        {
            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;
            DateTime trendStart = todayStart.AddDays(-(TrendDays - 1));
            DateOnly trendStartDate = DateOnly.FromDateTime(trendStart);
            DateTime categoryStart = todayStart.AddDays(-(CategoryDays - 1));
            List<DateTime> days = Enumerable.Range(0, TrendDays).Select(d => trendStart.AddDays(d)).ToList();

            IQueryable<LabOrderItem> active = _labOrderItemRepository
                .GetAllNoTracking(i => i.LabOrder!.OrderStatus != OrderStatus.Cancelled);

            // Daily orders
            List<DateOnly> orderDates = await _labOrderRepository
                .GetAllNoTracking(o => o.OrderDate >= trendStartDate)
                .Select(o => o.OrderDate)
                .ToListAsync(ct);

            List<LabTrendPointViewModel> dailyOrders = days
                .Select(d => new LabTrendPointViewModel(d.ToString("ddd"), orderDates.Count(o => o == DateOnly.FromDateTime(d))))
                .ToList();

            // Turnaround time per day of verification
            var verified = await active
                .Where(i => i.VerificationStatus == LabVerificationStatus.Verified && i.VerifiedAt >= trendStart)
                .Select(i => new { i.LabOrder!.OrderDate, i.LabOrder.OrderTime, i.VerifiedAt })
                .ToListAsync(ct);

            List<LabTrendPointViewModel> turnaround = days
                .Select(d =>
                {
                    var onDay = verified.Where(v => v.VerifiedAt!.Value.Date == d).ToList();
                    double hours = onDay.Count == 0 ? 0 : onDay.Average(v => (v.VerifiedAt!.Value - v.OrderDate.ToDateTime(v.OrderTime)).TotalHours);
                    return new LabTrendPointViewModel(d.ToString("ddd"), Math.Round(Math.Max(0, hours), 1));
                })
                .ToList();

            // Pending samples by stage
            List<LabTrendPointViewModel> pendingByStage = new()
            {
                new("Not collected", await active.CountAsync(i => i.SampleStatus == LabSampleStatus.NotCollected, ct)),
                new("Collected", await active.CountAsync(i => i.SampleStatus == LabSampleStatus.Collected || i.SampleStatus == LabSampleStatus.InTransit, ct)),
                new("Received", await active.CountAsync(i => i.SampleStatus == LabSampleStatus.Received && i.ResultValue == null, ct)),
                new("Awaiting verification", await active.CountAsync(i => i.ResultValue != null && i.VerificationStatus != LabVerificationStatus.Verified, ct)),
            };

            // Test categories (last 30 days)
            List<string?> categoryNames = await active
                .Where(i => i.CreatedAt >= categoryStart)
                .Select(i => i.LabTest!.Category!.Name)
                .ToListAsync(ct);

            List<LabTrendPointViewModel> categories = categoryNames
                .GroupBy(n => string.IsNullOrWhiteSpace(n) ? "Uncategorised" : n)
                .OrderByDescending(g => g.Count())
                .Take(6)
                .Select(g => new LabTrendPointViewModel(g.Key, g.Count()))
                .ToList();

            // Critical result rate (last 30 days, % of entered results)
            var resulted = await active
                .Where(i => i.ResultEnteredAt >= categoryStart)
                .Select(i => i.CritialFlag)
                .ToListAsync(ct);

            double criticalRate = resulted.Count == 0 ? 0 : Math.Round(resulted.Count(c => c) * 100.0 / resulted.Count, 1);

            // Technician workload (results entered in the last 7 days)
            var technicians = await active
                .Where(i => i.TechnicianId != null && i.ResultEnteredAt >= trendStart)
                .Select(i => new
                {
                    i.TechnicianId,
                    First = i.Technician!.Profile!.FirstName,
                    Middle = i.Technician.Profile.MiddleName,
                    Last = i.Technician.Profile.LastName
                })
                .ToListAsync(ct);

            List<LabTrendPointViewModel> workload = technicians
                .GroupBy(t => t.TechnicianId)
                .Select(g =>
                {
                    var t = g.First();
                    string name = $"{t.First} {(string.IsNullOrEmpty(t.Middle) ? "" : t.Middle + " ")}{t.Last}".Trim();
                    return new LabTrendPointViewModel(string.IsNullOrEmpty(name) ? "Unknown" : name, g.Count());
                })
                .OrderByDescending(p => p.Value)
                .Take(8)
                .ToList();

            return new LabDashboardTrendViewModel(dailyOrders, turnaround, pendingByStage, categories, criticalRate, workload);
        }
    }
}
