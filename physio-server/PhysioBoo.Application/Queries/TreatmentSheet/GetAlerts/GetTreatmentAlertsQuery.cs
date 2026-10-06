using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetAlerts
{
    public sealed record GetTreatmentAlertsQuery(Guid PatientId) : IRequest<List<TreatmentAlertViewModel>>;
}
