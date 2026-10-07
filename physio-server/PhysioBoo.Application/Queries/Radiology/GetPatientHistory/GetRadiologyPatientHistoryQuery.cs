using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetPatientHistory
{
    /// <param name="PatientKey">Patient id (GUID) or medical record number.</param>
    public sealed record GetRadiologyPatientHistoryQuery(string PatientKey) : IRequest<PagedResult<ImagingOrderRowViewModel>>;
}
