using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetAlerts
{
    public sealed class GetTreatmentAlertsQueryHandler : IRequestHandler<GetTreatmentAlertsQuery, List<TreatmentAlertViewModel>>
    {
        private readonly IClinicalAlertRepository _alertRepository;

        public GetTreatmentAlertsQueryHandler(IClinicalAlertRepository alertRepository)
        {
            _alertRepository = alertRepository;
        }

        public async Task<List<TreatmentAlertViewModel>> Handle(GetTreatmentAlertsQuery request, CancellationToken cancellationToken)
        {
            ClinicalAlertType[] alertTypes = TreatmentAlertViewModel.SupportedTypes;

            List<ClinicalAlert> alerts = await _alertRepository
                .GetAllNoTracking(a => a.PatientId == request.PatientId && !a.IsAcknowledged && alertTypes.Contains(a.Type))
                .ToListAsync(cancellationToken);

            // Severity is stored as text, so rank in memory: most severe first, then newest.
            return alerts
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.RaisedAt)
                .Select(TreatmentAlertViewModel.FromEntity)
                .ToList();
        }
    }
}
