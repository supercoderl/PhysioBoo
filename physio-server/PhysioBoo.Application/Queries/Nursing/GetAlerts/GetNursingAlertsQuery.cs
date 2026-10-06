using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Nursing.GetAlerts
{
    public sealed record GetNursingAlertsQuery(ShiftCode Shift) : IRequest<List<NursingAlertViewModel>>;
}
