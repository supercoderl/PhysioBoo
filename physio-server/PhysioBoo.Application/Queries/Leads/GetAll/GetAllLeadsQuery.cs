using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Leads.GetAll
{
    public sealed record GetAllLeadsQuery(PagedRequest<LeadFilter> Request) : IRequest<PagedResult<LeadViewModel>>;
}
