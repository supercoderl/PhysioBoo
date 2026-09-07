using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class AppointmentViewModelSortProvider : ISortingExpressionProvider<AppointmentViewModel, Appointment>
    {
        private static readonly Dictionary<string, Expression<Func<Appointment, object>>> s_expressions = new()
        {
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Appointment, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
