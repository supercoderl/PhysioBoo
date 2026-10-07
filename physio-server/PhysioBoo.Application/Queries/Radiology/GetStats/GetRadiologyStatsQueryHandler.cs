using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetStats
{
    public sealed class GetRadiologyStatsQueryHandler : IRequestHandler<GetRadiologyStatsQuery, RadiologyStatsViewModel>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IImagingReportRepository _imagingReportRepository;
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;

        public GetRadiologyStatsQueryHandler(
            IImagingOrderRepository imagingOrderRepository,
            IImagingReportRepository imagingReportRepository,
            IRadiologyAlertRepository radiologyAlertRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _imagingReportRepository = imagingReportRepository;
            _radiologyAlertRepository = radiologyAlertRepository;
        }

        public async Task<RadiologyStatsViewModel> Handle(GetRadiologyStatsQuery request, CancellationToken ct)
        {
            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;
            DateTime weekAgo = todayStart.AddDays(-6);

            IQueryable<ImagingOrder> orders = _imagingOrderRepository.GetAllNoTracking();
            IQueryable<ImagingReport> reports = _imagingReportRepository.GetAllNoTracking();

            // Sequential on purpose: the repositories share one DbContext.
            int totalOrders = await orders.CountAsync(o => o.CreatedAt >= todayStart, ct);
            int waiting = await orders.CountAsync(o => o.Status == ImagingOrderStatus.Ordered, ct);
            int scheduled = await orders.CountAsync(o => o.Status == ImagingOrderStatus.Scheduled || o.Status == ImagingOrderStatus.Arrived, ct);
            int inProgress = await orders.CountAsync(o => o.Status == ImagingOrderStatus.InProgress, ct);

            // Imaging done but the report is not written yet (none, still drafting, or sent back).
            int pendingReporting = await orders.CountAsync(o =>
                (o.Status == ImagingOrderStatus.ImagingCompleted || o.Status == ImagingOrderStatus.ImageUploaded ||
                 o.Status == ImagingOrderStatus.Completed || o.Status == ImagingOrderStatus.ReportPending) &&
                !o.ImagingReports.Any(r =>
                    r.WorkflowStatus == RadiologyReportStatus.PendingVerification ||
                    r.WorkflowStatus == RadiologyReportStatus.Verified ||
                    r.WorkflowStatus == RadiologyReportStatus.Released), ct);

            int pendingVerification = await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.PendingVerification, ct);
            int completed = await reports.CountAsync(r => r.WorkflowStatus == RadiologyReportStatus.Verified && r.VerifiedAt >= todayStart, ct);
            int critical = await _radiologyAlertRepository.GetAllNoTracking(a => !a.Acknowledged && a.Severity == RadiologyAlertSeverity.Critical).CountAsync(ct);

            // Turnaround = order created to report verified, over the last 7 days.
            var verified = await reports
                .Where(r => r.WorkflowStatus == RadiologyReportStatus.Verified && r.VerifiedAt >= weekAgo)
                .Select(r => new { r.ImagingOrder!.CreatedAt, r.VerifiedAt })
                .ToListAsync(ct);

            double tat = verified.Count == 0 ? 0 : Math.Round(verified.Average(v => (v.VerifiedAt!.Value - v.CreatedAt).TotalHours), 1);

            return new RadiologyStatsViewModel(
                totalOrders, waiting, scheduled, inProgress, pendingReporting, pendingVerification, completed, critical, Math.Max(0, tat));
        }
    }
}
