using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dispensing.GetStats
{
    public sealed class GetDispenseStatsQueryHandler : IRequestHandler<GetDispenseStatsQuery, DispenseQueueStatsViewModel>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IDispenseSessionRepository _sessionRepository;

        public GetDispenseStatsQueryHandler(
            IPrescriptionRepository prescriptionRepository,
            IDispenseSessionRepository sessionRepository
        )
        {
            _prescriptionRepository = prescriptionRepository;
            _sessionRepository = sessionRepository;
        }

        public async Task<DispenseQueueStatsViewModel> Handle(GetDispenseStatsQuery request, CancellationToken ct)
        {
            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;

            List<Guid> openIds = await _prescriptionRepository
                .GetAllNoTracking(p => DispensingMapper.DispensableStatuses.Contains(p.Status))
                .Select(p => p.Id)
                .ToListAsync(ct);

            var sessions = await _sessionRepository
                .GetAllNoTracking(s => openIds.Contains(s.PrescriptionId) || (s.CompletedAt != null && s.CompletedAt >= todayStart))
                .Select(s => new { s.PrescriptionId, s.Status, s.StartedAt, s.CompletedAt })
                .ToListAsync(ct);

            var inProgress = sessions.Where(s => openIds.Contains(s.PrescriptionId)
                && s.Status is DispenseStatus.Verifying or DispenseStatus.Preparing or DispenseStatus.Dispensing).ToList();
            var completedToday = sessions.Where(s => s.Status == DispenseStatus.Completed && s.CompletedAt >= todayStart).ToList();

            return new DispenseQueueStatsViewModel
            {
                PendingCount = openIds.Count - inProgress.Count,
                InProgressCount = inProgress.Count,
                CompletedTodayCount = completedToday.Count,
                AverageDispensingMinutes = completedToday.Count == 0
                    ? 0
                    : Math.Round(completedToday.Average(s => (s.CompletedAt!.Value - s.StartedAt).TotalMinutes), 1)
            };
        }
    }
}
