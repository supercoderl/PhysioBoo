using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Laboratory.GetStats
{
    public sealed class GetLabStatsQueryHandler : IRequestHandler<GetLabStatsQuery, LabStatsViewModel>
    {
        private readonly ILabOrderRepository _labOrderRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly ILabAlertRepository _labAlertRepository;

        public GetLabStatsQueryHandler(
            ILabOrderRepository labOrderRepository,
            ILabOrderItemRepository labOrderItemRepository,
            ILabAlertRepository labAlertRepository)
        {
            _labOrderRepository = labOrderRepository;
            _labOrderItemRepository = labOrderItemRepository;
            _labAlertRepository = labAlertRepository;
        }

        public async Task<LabStatsViewModel> Handle(GetLabStatsQuery request, CancellationToken ct)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateOnly today = DateOnly.FromDateTime(now);
            DateTime todayStart = now.Date;

            IQueryable<LabOrderItem> active = _labOrderItemRepository
                .GetAllNoTracking(i => i.LabOrder!.OrderStatus != OrderStatus.Cancelled);

            // Sequential on purpose: the repositories share one DbContext.
            int totalOrders = await _labOrderRepository.GetAllNoTracking(o => o.OrderDate == today).CountAsync(ct);
            int pendingCollection = await active.CountAsync(i => i.SampleStatus == LabSampleStatus.NotCollected, ct);
            int collected = await active.CountAsync(i => i.SampleStatus == LabSampleStatus.Collected || i.SampleStatus == LabSampleStatus.InTransit, ct);
            int inProcessing = await active.CountAsync(i => i.SampleStatus == LabSampleStatus.Received && i.ResultValue == null, ct);
            int pendingVerification = await active.CountAsync(i => i.ResultValue != null && i.VerificationStatus != LabVerificationStatus.Verified, ct);
            int completed = await active.CountAsync(i => i.VerificationStatus == LabVerificationStatus.Verified && i.VerifiedAt >= todayStart, ct);
            int critical = await _labAlertRepository.GetAllNoTracking(a => !a.Acknowledged && a.Severity == LabAlertSeverity.Critical).CountAsync(ct);

            // Turnaround = order time to verification, over the last 7 days.
            DateTime weekAgo = todayStart.AddDays(-6);
            var verified = await active
                .Where(i => i.VerificationStatus == LabVerificationStatus.Verified && i.VerifiedAt >= weekAgo)
                .Select(i => new { i.LabOrder!.OrderDate, i.LabOrder.OrderTime, i.VerifiedAt })
                .ToListAsync(ct);

            double averageTat = verified.Count == 0
                ? 0
                : Math.Round(verified.Average(v => (v.VerifiedAt!.Value - v.OrderDate.ToDateTime(v.OrderTime)).TotalHours), 1);

            return new LabStatsViewModel(
                totalOrders,
                pendingCollection,
                collected,
                inProcessing,
                pendingVerification,
                completed,
                critical,
                Math.Max(0, averageTat)
            );
        }
    }
}
