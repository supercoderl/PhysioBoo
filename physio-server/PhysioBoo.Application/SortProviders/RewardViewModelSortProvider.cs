using PhysioBoo.Application.ViewModels.Rewards;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class RewardViewModelSortProvider : ISortingExpressionProvider<RewardViewModel, Reward>
    {
        private static readonly Dictionary<string, Expression<Func<Reward, object>>> s_expressions = new()
        {
            { "code", x => x.Code }, { "title", x => x.Title },
            { "pointsrequired", x => x.PointsRequired },
            { "createddate", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Reward, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
