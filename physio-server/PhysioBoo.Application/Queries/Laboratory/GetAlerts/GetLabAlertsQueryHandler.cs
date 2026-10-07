using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Laboratory.GetAlerts
{
    public sealed class GetLabAlertsQueryHandler : IRequestHandler<GetLabAlertsQuery, List<LabCriticalAlertViewModel>>
    {
        private readonly ILabAlertRepository _labAlertRepository;

        public GetLabAlertsQueryHandler(ILabAlertRepository labAlertRepository)
        {
            _labAlertRepository = labAlertRepository;
        }

        public async Task<List<LabCriticalAlertViewModel>> Handle(GetLabAlertsQuery request, CancellationToken ct)
        {
            // Every open alert, plus anything acknowledged in the last 24 hours for context.
            DateTime since = TimeZoneHelper.GetLocalTimeNow().AddHours(-24);

            List<Domain.Entities.LaboratoryImaging.LabAlert> alerts = await _labAlertRepository
                .GetAllNoTracking(a => !a.Acknowledged || a.AcknowledgedAt >= since)
                .OrderByDescending(a => a.RaisedAt)
                .Take(LabWorkspace.DefaultPageSize)
                .ToListAsync(ct);

            return alerts.Select(LabCriticalAlertViewModel.FromEntity).ToList();
        }
    }
}
