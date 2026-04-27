using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.PatientInformation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class PatientViewModelSortProvider : ISortingExpressionProvider<PatientViewModel, Patient>
    {
        private static readonly Dictionary<string, Expression<Func<Patient, object>>> s_expressions = new()
        {
            { "patientnumber", patient => patient.PatientNumber },
            { "createdat", patient => patient.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Patient, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
