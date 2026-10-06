using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetPatientSummary
{
    public sealed record GetSurgeryPatientSummaryQuery(Guid PatientId) : IRequest<SurgeryPatientSummaryViewModel?>;
}
