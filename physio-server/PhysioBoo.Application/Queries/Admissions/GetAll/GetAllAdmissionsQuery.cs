using PhysioBoo.Application.ViewModels.Admissions;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Admissions.GetAll
{
    public sealed record GetAllAdmissionsQuery(PagedRequest<AdmissionFilter> Request) : IRequest<PagedResult<AdmissionViewModel>>;
}
