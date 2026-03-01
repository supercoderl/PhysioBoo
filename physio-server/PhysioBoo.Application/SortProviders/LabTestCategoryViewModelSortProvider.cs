using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class LabTestCategoryViewModelSortProvider : ISortingExpressionProvider<LabTestCategoryViewModel, LabTestCategory>
    {
        private static readonly Dictionary<string, Expression<Func<LabTestCategory, object>>> s_expressions = new()
        {
            { "name", labTestCategory => labTestCategory.Name },
            { "code", labTestCategory => labTestCategory.Code ?? string.Empty },
            { "createdat", labTestCategory => labTestCategory.CreatedAt }
        };

        public Dictionary<string, Expression<Func<LabTestCategory, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
