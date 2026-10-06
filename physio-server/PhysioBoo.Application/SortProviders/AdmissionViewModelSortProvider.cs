using PhysioBoo.Application.ViewModels.Admissions;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class AdmissionViewModelSortProvider : ISortingExpressionProvider<AdmissionViewModel, Admission>
    {
        private static readonly Dictionary<string, Expression<Func<Admission, object>>> s_expressions = new()
        {
            { "admissionnumber", x => x.AdmissionNumber }, { "admittedat", x => x.AdmittedAt },
            { "status", x => x.Status }, { "admissiontype", x => x.AdmissionType },
            { "patientname", x => x.Patient!.Profile!.FirstName },
            { "createdat", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Admission, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
