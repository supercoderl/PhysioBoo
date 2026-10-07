using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetPatientSummary
{
    /// <param name="PatientKey">Patient id (GUID) or medical record number.</param>
    public sealed record GetRadiologyPatientSummaryQuery(string PatientKey) : IRequest<RadiologyPatientStudySummaryViewModel?>;
}
