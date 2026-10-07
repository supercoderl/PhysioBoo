using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetAlerts
{
    public sealed class GetRadiologyAlertsQueryHandler : IRequestHandler<GetRadiologyAlertsQuery, List<CriticalFindingAlertViewModel>>
    {
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;

        public GetRadiologyAlertsQueryHandler(IRadiologyAlertRepository radiologyAlertRepository)
        {
            _radiologyAlertRepository = radiologyAlertRepository;
        }

        public async Task<List<CriticalFindingAlertViewModel>> Handle(GetRadiologyAlertsQuery request, CancellationToken ct)
        {
            // Every open alert, plus anything acknowledged in the last 24 hours for context.
            DateTime since = TimeZoneHelper.GetLocalTimeNow().AddHours(-24);

            List<Domain.Entities.LaboratoryImaging.RadiologyAlert> alerts = await _radiologyAlertRepository
                .GetAllNoTracking(a => !a.Acknowledged || a.AcknowledgedAt >= since)
                .OrderByDescending(a => a.RaisedAt)
                .Take(RadiologyWorkspace.DefaultPageSize)
                .ToListAsync(ct);

            return alerts.Select(CriticalFindingAlertViewModel.FromEntity).ToList();
        }
    }
}
