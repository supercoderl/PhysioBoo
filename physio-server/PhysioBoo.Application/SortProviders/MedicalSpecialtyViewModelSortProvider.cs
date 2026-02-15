using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.MedicalStaff;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class MedicalSpecialtyViewModelSortProvider : ISortingExpressionProvider<MedicalSpecialtyViewModel, MedicalSpecialty>
    {
        private static readonly Dictionary<string, Expression<Func<MedicalSpecialty, object>>> s_expressions = new()
        {
            { "name", user => user.Name },
            { "code", user => user.Code ?? string.Empty },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<MedicalSpecialty, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
