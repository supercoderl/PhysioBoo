using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Entities.Support;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class SupplierViewModelSortProvider : ISortingExpressionProvider<SupplierViewModel, Supplier>
    {
        private static readonly Dictionary<string, Expression<Func<Supplier, object>>> s_expressions = new()
        {
            { "name", supplier => supplier.SupplierName },
            { "code", supplier => supplier.SupplierCode ?? string.Empty },
            { "createdat", supplier => supplier.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Supplier, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
