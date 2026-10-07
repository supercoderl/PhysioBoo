using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetTrends
{
    public sealed class GetRadiologyTrendsQueryHandler : IRequestHandler<GetRadiologyTrendsQuery, RadiologyDashboardTrendViewModel>
    {
        private const int TrendDays = 7;
        private const int MixDays = 30;
        private const double RoomMinutesPerDay = 8 * 60;

        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IImagingReportRepository _imagingReportRepository;

        public GetRadiologyTrendsQueryHandler(IImagingOrderRepository imagingOrderRepository, IImagingReportRepository imagingReportRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _imagingReportRepository = imagingReportRepository;
        }

        public async Task<RadiologyDashboardTrendViewModel> Handle(GetRadiologyTrendsQuery request, CancellationToken ct)
        {
            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;
            DateOnly today = DateOnly.FromDateTime(todayStart);
            DateTime trendStart = todayStart.AddDays(-(TrendDays - 1));
            DateTime mixStart = todayStart.AddDays(-(MixDays - 1));
            List<DateTime> days = Enumerable.Range(0, TrendDays).Select(d => trendStart.AddDays(d)).ToList();

            IQueryable<ImagingOrder> orders = _imagingOrderRepository.GetAllNoTracking();
            IQueryable<ImagingReport> reports = _imagingReportRepository.GetAllNoTracking();

            // Imaging volume: exams completed per day
            List<DateTime?> completedAt = await orders
                .Where(o => o.ImagingCompletedAt >= trendStart)
                .Select(o => o.ImagingCompletedAt)
                .ToListAsync(ct);

            List<RadiologyTrendPointViewModel> volume = days
                .Select(d => new RadiologyTrendPointViewModel(d.ToString("ddd"), completedAt.Count(c => c!.Value.Date == d)))
                .ToList();

            // Turnaround per day of verification
            var verified = await reports
                .Where(r => r.WorkflowStatus == RadiologyReportStatus.Verified && r.VerifiedAt >= trendStart)
                .Select(r => new { r.ImagingOrder!.CreatedAt, r.VerifiedAt })
                .ToListAsync(ct);

            List<RadiologyTrendPointViewModel> turnaround = days
                .Select(d =>
                {
                    var onDay = verified.Where(v => v.VerifiedAt!.Value.Date == d).ToList();
                    double hours = onDay.Count == 0 ? 0 : onDay.Average(v => (v.VerifiedAt!.Value - v.CreatedAt).TotalHours);
                    return new RadiologyTrendPointViewModel(d.ToString("ddd"), Math.Round(Math.Max(0, hours), 1));
                })
                .ToList();

            // Modality mix (last 30 days)
            List<string?> modalities = await orders
                .Where(o => o.CreatedAt >= mixStart)
                .Select(o => o.Modality!.Name)
                .ToListAsync(ct);

            List<RadiologyTrendPointViewModel> modalityUse = modalities
                .GroupBy(m => string.IsNullOrWhiteSpace(m) ? "Other" : m)
                .OrderByDescending(g => g.Count())
                .Select(g => new RadiologyTrendPointViewModel(g.Key, g.Count()))
                .ToList();

            // Open reports by status
            List<RadiologyTrendPointViewModel> pendingReports = new()
            {
                new("Reporting", await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.Reporting, ct)),
                new("Pending verification", await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.PendingVerification, ct)),
                new("Returned for revision", await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.ReturnedForRevision, ct)),
                new("Rejected", await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.Rejected, ct)),
            };

            // Critical finding rate (last 30 days, % of verified reports)
            List<bool> verifiedCritical = await reports
                .Where(r => r.WorkflowStatus == RadiologyReportStatus.Verified && r.VerifiedAt >= mixStart)
                .Select(r => r.IsCritical)
                .ToListAsync(ct);

            double criticalRate = verifiedCritical.Count == 0 ? 0 : Math.Round(verifiedCritical.Count(c => c) * 100.0 / verifiedCritical.Count, 1);

            // Radiologist workload: reports verified in the last 7 days, by verifier
            var verifiers = await reports
                .Where(r => r.VerifierId != null && r.VerifiedAt >= trendStart)
                .Select(r => new
                {
                    r.VerifierId,
                    First = r.Verifier!.Profile!.FirstName,
                    Middle = r.Verifier.Profile.MiddleName,
                    Last = r.Verifier.Profile.LastName
                })
                .ToListAsync(ct);

            List<RadiologyTrendPointViewModel> workload = verifiers
                .GroupBy(v => v.VerifierId)
                .Select(g =>
                {
                    var v = g.First();
                    string name = $"{v.First} {(string.IsNullOrEmpty(v.Middle) ? "" : v.Middle + " ")}{v.Last}".Trim();
                    return new RadiologyTrendPointViewModel(string.IsNullOrEmpty(name) ? "Unknown" : name, g.Count());
                })
                .OrderByDescending(p => p.Value)
                .Take(8)
                .ToList();

            // Equipment utilisation: booked minutes today per room, as % of an 8-hour day
            var booked = await orders
                .Where(o => o.ScheduledDate == today && o.Status != ImagingOrderStatus.Cancelled)
                .Select(o => new { o.RoomName, ModalityName = o.Modality!.Name, o.EstimatedDuration, Average = o.Modality.AverageDurationMinutes })
                .ToListAsync(ct);

            List<RadiologyTrendPointViewModel> equipment = booked
                .GroupBy(b => b.RoomName ?? $"{b.ModalityName ?? "Imaging"} Room 1")
                .Select(g => new RadiologyTrendPointViewModel(
                    g.Key,
                    Math.Round(Math.Min(100, g.Sum(b => b.EstimatedDuration > 0 ? b.EstimatedDuration : Math.Max(15, b.Average)) * 100.0 / RoomMinutesPerDay), 1)))
                .OrderByDescending(p => p.Value)
                .ToList();

            return new RadiologyDashboardTrendViewModel(volume, turnaround, modalityUse, pendingReports, criticalRate, workload, equipment);
        }
    }
}
