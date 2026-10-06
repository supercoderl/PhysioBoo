using PhysioBoo.Application.ViewModels.Rewards;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Rewards.GetAll
{
    public sealed record GetAllRewardsQuery(PagedRequest<RewardFilter> Request) : IRequest<PagedResult<RewardViewModel>>;
}
