using PhysioBoo.Application.ViewModels.Rewards;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Rewards.GetAll
{
    public sealed class GetAllRewardsQueryHandler : IRequestHandler<GetAllRewardsQuery, PagedResult<RewardViewModel>>
    {
        private readonly IRewardRepository _rewardRepository;
        private readonly ISortingExpressionProvider<RewardViewModel, Reward> _sortingExpressionProvider;

        public GetAllRewardsQueryHandler(
            IRewardRepository rewardRepository,
            ISortingExpressionProvider<RewardViewModel, Reward> sortingExpressionProvider
        )
        {
            _rewardRepository = rewardRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<RewardViewModel>> Handle(GetAllRewardsQuery q, CancellationToken cancellationToken)
        {
            RewardsSearchSpec spec = new RewardsSearchSpec(q, _sortingExpressionProvider);
            PagedResult<Reward> paged = await _rewardRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<RewardViewModel>(
                paged.TotalCount,
                paged.Items.Select(RewardViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
