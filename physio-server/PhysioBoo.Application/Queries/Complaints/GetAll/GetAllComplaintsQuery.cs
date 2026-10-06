using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Complaints.GetAll
{
    public sealed record GetAllComplaintsQuery(PagedRequest<ComplaintFilter> Request) : IRequest<PagedResult<ComplaintViewModel>>;
}
