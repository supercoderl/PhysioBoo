using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class LeadViewModelSortProvider : ISortingExpressionProvider<LeadViewModel, Lead>
    {
        private static readonly Dictionary<string, Expression<Func<Lead, object>>> s_expressions = new()
        {
            { "name", x => x.Name }, { "email", x => x.Email },
            { "createdat", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Lead, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
