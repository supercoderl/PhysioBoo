using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class HospitalGroupViewModelSortProvider : ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup>
    {
        private static readonly Dictionary<string, Expression<Func<HospitalGroup, object>>> s_expressions = new()
        {
            { "name", hospitalGroup => hospitalGroup.Name },
            { "createdat", hospitalGroup => hospitalGroup.CreatedAt }
        };

        public Dictionary<string, Expression<Func<HospitalGroup, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
