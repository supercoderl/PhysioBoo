using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dashboard;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    public sealed partial class GetDashboardOverviewQueryHandler
    {
        // Targets are benchmarks from history (no target table exists): the trailing 28-day daily average.
        private const int BenchmarkDays = 28;

        private async Task<FinancialClinicalSnapshotViewModel> GetFinancialAsync(DateOnly day, DateTime dayStart, DateTime dayEnd, CancellationToken ct)
        {
            return new FinancialClinicalSnapshotViewModel(
                await GetRevenueAsync(day, ct),
                await GetInsuranceClaimsAsync(dayStart, ct),
                await GetPharmacyAsync(dayStart, dayEnd, ct),
                await GetLaboratoryAsync(dayStart, ct),
                await GetRadiologyAsync(day, dayStart, ct)
            );
        }

        private async Task<RevenueSnapshotViewModel> GetRevenueAsync(DateOnly day, CancellationToken ct)
        {
            DateOnly from = day.AddDays(-BenchmarkDays);

            var payments = await _paymentRepository
                .GetAllNoTracking(p => p.PaymentDate >= from && p.PaymentDate <= day &&
                                       (p.Status == PaymentStatus.Paid || p.Status == PaymentStatus.Partial))
                .Select(p => new { p.PaymentDate, Net = p.Amount - p.RefundAmount })
                .ToListAsync(ct);

            decimal On(DateOnly d) => payments.Where(p => p.PaymentDate == d).Sum(p => p.Net);

            decimal today = On(day);
            decimal yesterday = On(day.AddDays(-1));
            decimal history = payments.Where(p => p.PaymentDate < day).Sum(p => p.Net);
            decimal target = Math.Round(history / BenchmarkDays, 2);

            List<decimal> trend = Enumerable.Range(0, 7).Select(i => On(day.AddDays(i - 6))).ToList();

            return new RevenueSnapshotViewModel(today, target > 0 ? target : today, ChangePct((double)today, (double)yesterday), trend);
        }

        private async Task<InsuranceClaimsSnapshotViewModel> GetInsuranceClaimsAsync(DateTime dayStart, CancellationToken ct)
        {
            DateTime monthAgo = dayStart.AddDays(-30);
            InsuranceClaimStatus[] open =
            {
                InsuranceClaimStatus.Submitted, InsuranceClaimStatus.UnderReview,
                InsuranceClaimStatus.NeedCorrection, InsuranceClaimStatus.Appealed
            };

            var pending = await _insuranceClaimRepository
                .GetAllNoTracking(c => open.Contains(c.Status))
                .Select(c => c.Priority)
                .ToListAsync(ct);

            var decided = await _insuranceClaimRepository
                .GetAllNoTracking(c => c.DecidedAt >= monthAgo)
                .Select(c => new { c.Status, c.SubmittedAt, c.DecidedAt })
                .ToListAsync(ct);

            int approved = decided.Count(c => c.Status is InsuranceClaimStatus.Approved or InsuranceClaimStatus.Settled);
            var timed = decided.Where(c => c.SubmittedAt != null).ToList();
            double avgDays = timed.Count == 0 ? 0 : Math.Round(timed.Average(c => (c.DecidedAt!.Value - c.SubmittedAt!.Value).TotalDays), 1);

            return new InsuranceClaimsSnapshotViewModel(
                pending.Count,
                Pct(approved, decided.Count),
                pending.Count(p => p == InsuranceClaimPriority.Urgent),
                Math.Max(0, avgDays));
        }

        private async Task<PharmacySnapshotViewModel> GetPharmacyAsync(DateTime dayStart, DateTime dayEnd, CancellationToken ct)
        {
            DateTime from = dayStart.AddDays(-BenchmarkDays);

            List<DateTime?> completed = await _dispenseSessionRepository
                .GetAllNoTracking(s => s.Status == DispenseStatus.Completed && s.CompletedAt >= from && s.CompletedAt < dayEnd)
                .Select(s => s.CompletedAt)
                .ToListAsync(ct);

            int today = completed.Count(c => c >= dayStart);
            int target = (int)Math.Round(completed.Count(c => c < dayStart) / (double)BenchmarkDays);

            int lowStock = await _inventoryAlertRepository
                .GetAllNoTracking(a => a.AcknowledgedAt == null && (a.Type == InventoryAlertType.LowStock || a.Type == InventoryAlertType.OutOfStock))
                .CountAsync(ct);

            return new PharmacySnapshotViewModel(today, Math.Max(target, today), lowStock);
        }

        private async Task<LaboratorySnapshotViewModel> GetLaboratoryAsync(DateTime dayStart, CancellationToken ct)
        {
            DateTime weekAgo = dayStart.AddDays(-6);

            var pending = await _labOrderItemRepository
                .GetAllNoTracking(i => i.LabOrder!.OrderStatus != OrderStatus.Cancelled &&
                                       i.VerificationStatus != LabVerificationStatus.Verified &&
                                       i.SampleStatus != LabSampleStatus.Rejected)
                .Select(i => i.LabOrder!.LabPriority)
                .ToListAsync(ct);

            var verified = await _labOrderItemRepository
                .GetAllNoTracking(i => i.VerificationStatus == LabVerificationStatus.Verified && i.VerifiedAt >= weekAgo)
                .Select(i => new { i.LabOrder!.OrderDate, i.LabOrder.OrderTime, i.VerifiedAt })
                .ToListAsync(ct);

            double tat = verified.Count == 0 ? 0 : Math.Round(verified.Average(v => (v.VerifiedAt!.Value - v.OrderDate.ToDateTime(v.OrderTime)).TotalHours), 1);

            return new LaboratorySnapshotViewModel(
                pending.Count,
                Math.Max(0, tat),
                pending.Count(p => p is LabPriority.Stat or LabPriority.Emergency));
        }

        private async Task<RadiologySnapshotViewModel> GetRadiologyAsync(DateOnly day, DateTime dayStart, CancellationToken ct)
        {
            DateTime weekAgo = dayStart.AddDays(-6);

            int inQueue = await _imagingOrderRepository
                .GetAllNoTracking(o => o.ScheduledDate == day && o.Status != ImagingOrderStatus.Cancelled &&
                                       (o.QueueStatus == null || o.QueueStatus == RadiologyQueueStatus.Waiting || o.QueueStatus == RadiologyQueueStatus.Called))
                .CountAsync(ct);

            // Read time = imaging completed to report verified.
            var reads = await _imagingOrderRepository
                .GetAllNoTracking(o => o.ImagingCompletedAt != null &&
                                       o.ImagingReports.Any(r => r.WorkflowStatus == RadiologyReportStatus.Verified && r.VerifiedAt >= weekAgo))
                .Select(o => new
                {
                    o.ImagingCompletedAt,
                    VerifiedAt = o.ImagingReports
                        .Where(r => r.WorkflowStatus == RadiologyReportStatus.Verified)
                        .Max(r => r.VerifiedAt)
                })
                .ToListAsync(ct);

            double avgRead = reads.Count == 0 ? 0 : Math.Round(reads.Average(r => (r.VerifiedAt!.Value - r.ImagingCompletedAt!.Value).TotalMinutes));

            int urgentPending = await _imagingOrderRepository
                .GetAllNoTracking(o => o.ImagingCompletedAt != null &&
                                       o.LabPriority != LabPriority.Routine &&
                                       !o.ImagingReports.Any(r => r.WorkflowStatus == RadiologyReportStatus.Verified))
                .CountAsync(ct);

            return new RadiologySnapshotViewModel(inQueue, Math.Max(0, avgRead), urgentPending);
        }
    }
}
