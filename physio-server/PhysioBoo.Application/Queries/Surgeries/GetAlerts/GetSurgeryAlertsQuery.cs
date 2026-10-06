using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetAlerts
{
    public sealed record GetSurgeryAlertsQuery : IRequest<List<SurgeryAlertViewModel>>;
}
