using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetPatientHistory
{
    /// <param name="PatientKey">Patient id (GUID) or medical record number.</param>
    public sealed record GetLabPatientHistoryQuery(string PatientKey) : IRequest<PagedResult<LabOrderRowViewModel>>;
}
