using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HospitalGroups.GetAll
{
    public sealed record GetAllHospitalGroupsQuery(
        PagedRequest<HospitalGroupFilter> Request
    ) : IRequest<PagedResult<HospitalGroupViewModel>>;
}
