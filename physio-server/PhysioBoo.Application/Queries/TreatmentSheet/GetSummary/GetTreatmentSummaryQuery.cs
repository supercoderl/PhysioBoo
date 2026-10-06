using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetSummary
{
    public sealed record GetTreatmentSummaryQuery(Guid PatientId) : IRequest<TreatmentPatientSummaryViewModel?>;
}
