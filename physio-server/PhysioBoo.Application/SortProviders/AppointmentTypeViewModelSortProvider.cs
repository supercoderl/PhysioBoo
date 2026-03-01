using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class AppointmentTypeViewModelSortProvider : ISortingExpressionProvider<AppointmentTypeViewModel, AppointmentType>
    {
        private static readonly Dictionary<string, Expression<Func<AppointmentType, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.Code ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<AppointmentType, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
