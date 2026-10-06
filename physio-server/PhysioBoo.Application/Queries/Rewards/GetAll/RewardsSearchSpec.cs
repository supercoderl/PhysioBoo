using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Rewards;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Rewards.GetAll
{
    public sealed class RewardsSearchSpec : Specification<Reward>
    {
        public RewardsSearchSpec(
            GetAllRewardsQuery q,
            ISortingExpressionProvider<RewardViewModel, Reward> sortingExpressionProvider
        )
        {
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.Title, pattern) ||
                    EF.Functions.ILike(x.Code, pattern)
                );
            }

            RewardFilter? filter = q.Request.Filter;
            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Category) && Enum.TryParse(filter.Category, true, out RewardCategory category))
                {
                    Query.Where(x => x.Category == category);
                }

                if (filter.Available.HasValue)
                {
                    Query.Where(x => x.IsAvailable == filter.Available.Value);
                }
            }

            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
