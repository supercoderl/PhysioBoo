using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Surgeries.SearchCases
{
    public sealed class SearchSurgeriesQueryHandler : IRequestHandler<SearchSurgeriesQuery, PagedResult<SurgeryRowViewModel>>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;

        public SearchSurgeriesQueryHandler(ISurgeryCaseRepository surgeryRepository)
        {
            _surgeryRepository = surgeryRepository;
        }

        public async Task<PagedResult<SurgeryRowViewModel>> Handle(SearchSurgeriesQuery q, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            SurgeriesSearchSpec spec = new SurgeriesSearchSpec(q, now);
            PagedResult<SurgeryCase> paged = await _surgeryRepository.ListAsync(spec, q.PageNumber, q.PageSize, cancellationToken);

            return new PagedResult<SurgeryRowViewModel>(
                paged.TotalCount,
                paged.Items.Select(c => SurgeryRowViewModel.FromEntity(c, now)).ToList(),
                q.PageNumber,
                q.PageSize
            );
        }
    }
}
