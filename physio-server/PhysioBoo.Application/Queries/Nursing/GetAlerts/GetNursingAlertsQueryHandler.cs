using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing.GetAlerts
{
    public sealed class GetNursingAlertsQueryHandler : IRequestHandler<GetNursingAlertsQuery, List<NursingAlertViewModel>>
    {
        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IUser _user;

        public GetNursingAlertsQueryHandler(
            INursingAssignmentRepository assignmentRepository,
            IClinicalAlertRepository alertRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IUser user
        )
        {
            _assignmentRepository = assignmentRepository;
            _alertRepository = alertRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _user = user;
        }

        public async Task<List<NursingAlertViewModel>> Handle(GetNursingAlertsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            List<NursingAssignment> assignments = await NursingScope.GetMyAssignmentsAsync(
                _assignmentRepository, _user.GetUserId(), request.Shift, now, string.Empty, cancellationToken);

            List<Guid> patientIds = assignments.Select(a => a.PatientId).Distinct().ToList();
            if (patientIds.Count == 0) return new List<NursingAlertViewModel>();

            ClinicalAlertType[] alertTypes = NursingAlertViewModel.SupportedTypes;

            List<ClinicalAlert> alerts = await _alertRepository
                .GetAllNoTracking(
                    a => patientIds.Contains(a.PatientId) && !a.IsAcknowledged && alertTypes.Contains(a.Type),
                    includeProperties: "Patient.Profile")
                .ToListAsync(cancellationToken);

            List<BedAssignment> stays = await _bedAssignmentRepository
                .GetAllNoTracking(a => patientIds.Contains(a.PatientId) && a.DischargedAt == null, includeProperties: "Bed")
                .ToListAsync(cancellationToken);

            // Severity is stored as text, so rank in memory: most severe first, then newest.
            return alerts
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.RaisedAt)
                .Select(a => NursingAlertViewModel.FromEntity(a, stays.FirstOrDefault(s => s.PatientId == a.PatientId)?.Bed?.Number))
                .ToList();
        }
    }
}
