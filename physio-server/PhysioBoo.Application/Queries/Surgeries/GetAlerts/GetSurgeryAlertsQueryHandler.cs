using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetAlerts
{
    public sealed class GetSurgeryAlertsQueryHandler : IRequestHandler<GetSurgeryAlertsQuery, List<SurgeryAlertViewModel>>
    {
        private readonly ISurgeryAlertRepository _alertRepository;

        public GetSurgeryAlertsQueryHandler(ISurgeryAlertRepository alertRepository)
        {
            _alertRepository = alertRepository;
        }

        public async Task<List<SurgeryAlertViewModel>> Handle(GetSurgeryAlertsQuery request, CancellationToken cancellationToken)
        {
            List<SurgeryAlert> alerts = await _alertRepository
                .GetAllNoTracking(a => !a.IsAcknowledged, includeProperties: "Patient.Profile,SurgeryCase")
                .ToListAsync(cancellationToken);

            // Severity is stored as text, so rank in memory: most severe first, then newest.
            return alerts
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.RaisedAt)
                .Select(SurgeryAlertViewModel.FromEntity)
                .ToList();
        }
    }
}
