using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.MedicalStaff;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class DoctorViewModelSortProvider : ISortingExpressionProvider<DoctorViewModel, Doctor>
    {
        private static readonly Dictionary<string, Expression<Func<Doctor, object>>> s_expressions = new()
        {
            { "employeeid", doctor => doctor.EmployeeId ?? string.Empty }
        };

        public Dictionary<string, Expression<Func<Doctor, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
