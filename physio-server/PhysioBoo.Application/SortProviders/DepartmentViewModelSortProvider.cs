using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class DepartmentViewModelSortProvider : ISortingExpressionProvider<DepartmentViewModel, Department>
    {
        private static readonly Dictionary<string, Expression<Func<Department, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.DepartmentCode ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Department, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
