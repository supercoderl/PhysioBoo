using PhysioBoo.Application.ViewModels.Leads;

namespace PhysioBoo.Application.Queries.Leads.GetById
{
    public sealed record GetLeadByIdQuery(Guid Id) : IRequest<LeadViewModel?>;
}
