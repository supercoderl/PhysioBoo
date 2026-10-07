using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetAlerts
{
    public sealed record GetRadiologyAlertsQuery() : IRequest<List<CriticalFindingAlertViewModel>>;
}
