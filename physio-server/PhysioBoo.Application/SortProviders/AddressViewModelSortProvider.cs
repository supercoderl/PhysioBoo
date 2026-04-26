using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class AddressViewModelSortProvider : ISortingExpressionProvider<AddressViewModel, Address>
    {
        private static readonly Dictionary<string, Expression<Func<Address, object>>> s_expressions = new()
        {
            { "city", address => address.City },
            { "country", address => address.Country },
            { "createdat", address => address.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Address, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
