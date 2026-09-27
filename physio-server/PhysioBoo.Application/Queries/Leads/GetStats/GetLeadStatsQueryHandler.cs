using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Leads.GetStats
{
    public sealed class GetLeadStatsQueryHandler : IRequestHandler<GetLeadStatsQuery, LeadStatsViewModel>
    {
        private readonly ILeadRepository _leadRepository;

        public GetLeadStatsQueryHandler(
            ILeadRepository leadRepository
        )
        {
            _leadRepository = leadRepository;
        }

        public async Task<LeadStatsViewModel> Handle(GetLeadStatsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Domain.Entities.Crm.Lead> leads = _leadRepository.GetAllNoTracking();
            return new LeadStatsViewModel
            {
                TotalLeads = await leads.CountAsync(cancellationToken),
                NewLeads = await leads.CountAsync(l => l.Status == LeadStatus.New, cancellationToken),
                QualifiedLeads = await leads.CountAsync(l => l.Status == LeadStatus.Qualified, cancellationToken),
                ConvertedLeads = await leads.CountAsync(l => l.Status == LeadStatus.Converted, cancellationToken)
            };
        }
    }
}
