using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Dispensing.GetQueue
{
    /// <summary>
    /// Issued / partially dispensed prescriptions, plus those closed today so the pharmacist
    /// can still see what was completed or cancelled during the shift.
    /// </summary>
    public sealed class GetDispenseQueueQueryHandler : IRequestHandler<GetDispenseQueueQuery, PagedResult<DispenseQueueItemViewModel>>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IDispenseSessionRepository _sessionRepository;

        public GetDispenseQueueQueryHandler(
            IPrescriptionRepository prescriptionRepository,
            IDispenseSessionRepository sessionRepository
        )
        {
            _prescriptionRepository = prescriptionRepository;
            _sessionRepository = sessionRepository;
        }

        public async Task<PagedResult<DispenseQueueItemViewModel>> Handle(GetDispenseQueueQuery request, CancellationToken ct)
        {
            DateTime todayStart = TimeZoneHelper.GetLocalTimeNow().Date;

            List<Guid> closedTodayIds = await _sessionRepository
                .GetAllNoTracking(s =>
                    (s.Status == DispenseStatus.Completed || s.Status == DispenseStatus.Cancelled) &&
                    (s.CompletedAt ?? s.UpdatedAt ?? s.CreatedAt) >= todayStart)
                .Select(s => s.PrescriptionId)
                .ToListAsync(ct);

            List<Prescription> prescriptions = await _prescriptionRepository
                .GetAllNoTracking(
                    p => DispensingMapper.DispensableStatuses.Contains(p.Status) || closedTodayIds.Contains(p.Id),
                    includeProperties: "Patient.Profile,Doctor.User.Profile,Doctor.Department,Hospital,PrescriptionItems.PrescriptionClinicalWarnings")
                .AsSplitQuery()
                .ToListAsync(ct);

            List<Guid> ids = prescriptions.Select(p => p.Id).ToList();
            Dictionary<Guid, DispenseSession> sessions = await _sessionRepository
                .GetAllNoTracking(s => ids.Contains(s.PrescriptionId))
                .ToDictionaryAsync(s => s.PrescriptionId, ct);

            // Queue numbers follow issue order, so they stay stable while the list is filtered.
            List<DispenseQueueItemViewModel> items = prescriptions
                .OrderBy(p => p.IssuedAt ?? p.CreatedAt)
                .Select((p, index) => DispensingMapper.ToQueueItem(p, sessions.GetValueOrDefault(p.Id), index + 1))
                .ToList();

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                items = items.Where(i => string.Equals(i.Status, request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim();
                items = items.Where(i =>
                    i.PrescriptionNumber.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    i.PatientName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    i.Mrn.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            static int PriorityRank(string priority) => priority switch { "Critical" => 0, "High" => 1, _ => 2 };

            items = items
                .OrderBy(i => i.Status is "Completed" or "Cancelled" ? 1 : 0)
                .ThenBy(i => PriorityRank(i.Priority))
                .ThenBy(i => i.QueueNumber)
                .ToList();

            return new PagedResult<DispenseQueueItemViewModel>(items.Count, items, 1, Math.Max(1, items.Count));
        }
    }
}
