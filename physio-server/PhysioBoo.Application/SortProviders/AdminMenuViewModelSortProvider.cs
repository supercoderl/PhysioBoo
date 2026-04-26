using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class AdminMenuViewModelSortProvider : ISortingExpressionProvider<AdminMenuViewModel, AdminMenu>
    {
        private static readonly Dictionary<string, Expression<Func<AdminMenu, object>>> s_expressions = new()
        {
            { "label", adminMenu => adminMenu.Label },
            { "route", adminMenu => adminMenu.Route },
            { "createdat", adminMenu => adminMenu.CreatedAt }
        };

        public Dictionary<string, Expression<Func<AdminMenu, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
