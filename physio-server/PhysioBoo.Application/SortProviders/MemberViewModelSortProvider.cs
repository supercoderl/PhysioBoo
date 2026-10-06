using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class MemberViewModelSortProvider : ISortingExpressionProvider<MemberViewModel, MemberPoint>
    {
        private static readonly Dictionary<string, Expression<Func<MemberPoint, object>>> s_expressions = new()
        {
            { "membernumber", x => x.MemberNumber }, { "points", x => x.Points },
            { "joindate", x => x.JoinedAt }, { "name", x => x.Patient!.Profile!.FirstName },
            { "createddate", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<MemberPoint, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
