using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Support;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class InsuranceCompanyViewModelSortProvider : ISortingExpressionProvider<InsuranceCompanyViewModel, InsuranceCompany>
    {
        private static readonly Dictionary<string, Expression<Func<InsuranceCompany, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.Code ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<InsuranceCompany, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
