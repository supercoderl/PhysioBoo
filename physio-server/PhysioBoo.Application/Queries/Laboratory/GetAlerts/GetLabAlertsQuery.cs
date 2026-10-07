using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Queries.Laboratory.GetAlerts
{
    public sealed record GetLabAlertsQuery() : IRequest<List<LabCriticalAlertViewModel>>;
}
