using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing.GetStats
{
    public sealed class GetNursingStatsQueryHandler : IRequestHandler<GetNursingStatsQuery, NursingStatsViewModel>
    {
        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly INursingTaskRepository _taskRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IUser _user;

        public GetNursingStatsQueryHandler(
            INursingAssignmentRepository assignmentRepository,
            INursingTaskRepository taskRepository,
            IClinicalAlertRepository alertRepository,
            IUser user
        )
        {
            _assignmentRepository = assignmentRepository;
            _taskRepository = taskRepository;
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task<NursingStatsViewModel> Handle(GetNursingStatsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            List<NursingAssignment> assignments = await NursingScope.GetMyAssignmentsAsync(
                _assignmentRepository, _user.GetUserId(), request.Shift, now, string.Empty, cancellationToken);

            List<Guid> patientIds = assignments.Select(a => a.PatientId).Distinct().ToList();
            if (patientIds.Count == 0) return new NursingStatsViewModel();

            ClinicalAlertType[] alertTypes = NursingAlertViewModel.SupportedTypes;

            return new NursingStatsViewModel
            {
                AssignedPatients = patientIds.Count,
                OpenTasks = await _taskRepository
                    .GetAllNoTracking(t => patientIds.Contains(t.PatientId) && t.Status == NursingTaskStatus.Pending)
                    .CountAsync(cancellationToken),
                OverdueTasks = await _taskRepository
                    .GetAllNoTracking(t => patientIds.Contains(t.PatientId) && t.Status == NursingTaskStatus.Pending && t.DueAt < now)
                    .CountAsync(cancellationToken),
                ActiveAlerts = await _alertRepository
                    .GetAllNoTracking(a => patientIds.Contains(a.PatientId) && !a.IsAcknowledged && alertTypes.Contains(a.Type))
                    .CountAsync(cancellationToken)
            };
        }
    }
}
