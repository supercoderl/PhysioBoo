using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Queries.Laboratory.GetPatientSummary
{
    /// <param name="PatientKey">Patient id (GUID) or medical record number.</param>
    public sealed record GetLabPatientSummaryQuery(string PatientKey) : IRequest<LabPatientResultSummaryViewModel?>;
}
