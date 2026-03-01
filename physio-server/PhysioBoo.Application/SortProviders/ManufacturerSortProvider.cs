using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Support;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class ManufacturerViewModelSortProvider : ISortingExpressionProvider<ManufacturerViewModel, Manufacturer>
    {
        private static readonly Dictionary<string, Expression<Func<Manufacturer, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.CompanyCode ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Manufacturer, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
