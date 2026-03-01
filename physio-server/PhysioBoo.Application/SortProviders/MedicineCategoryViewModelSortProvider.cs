using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Clinical;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class MedicineCategoryViewModelSortProvider : ISortingExpressionProvider<MedicineCategoryViewModel, MedicineCategory>
    {
        private static readonly Dictionary<string, Expression<Func<MedicineCategory, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.Code ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<MedicineCategory, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
