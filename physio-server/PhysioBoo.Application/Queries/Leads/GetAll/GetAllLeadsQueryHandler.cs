using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Leads.GetAll
{
    public sealed class GetAllLeadsQueryHandler : IRequestHandler<GetAllLeadsQuery, PagedResult<LeadViewModel>>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly ISortingExpressionProvider<LeadViewModel, Lead> _sortingExpressionProvider;

        public GetAllLeadsQueryHandler(
            ILeadRepository leadRepository,
            ISortingExpressionProvider<LeadViewModel, Lead> sortingExpressionProvider
        )
        {
            _leadRepository = leadRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<LeadViewModel>> Handle(GetAllLeadsQuery q, CancellationToken cancellationToken)
        {
            LeadsSearchSpec spec = new LeadsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Lead> paged = await _leadRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);

            return new PagedResult<LeadViewModel>(
                paged.TotalCount,
                paged.Items.Select(l => LeadViewModel.FromEntity(l)).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
