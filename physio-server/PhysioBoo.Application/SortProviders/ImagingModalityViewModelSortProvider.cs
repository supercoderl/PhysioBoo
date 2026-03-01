using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class ImagingModalityViewModelSortProvider : ISortingExpressionProvider<ImagingModalityViewModel, ImagingModality>
    {
        private static readonly Dictionary<string, Expression<Func<ImagingModality, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.Code ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<ImagingModality, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
