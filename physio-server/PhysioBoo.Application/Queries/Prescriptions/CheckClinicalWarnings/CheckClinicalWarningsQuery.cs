
using PhysioBoo.Application.ViewModels.Prescriptions;

namespace PhysioBoo.Application.Queries.Prescriptions.CheckClinicalWarnings
{
    public sealed record CheckClinicalWarningsQuery(
        Guid PatientId,
        List<CdsCheckItemInput> Items,
        Guid? ExcludePrescriptionId = null
    ) : IRequest<Dictionary<Guid, List<ClinicalWarningViewModel>>>;
}
