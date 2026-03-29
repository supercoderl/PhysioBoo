using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class HospitalViewModelSortProvider : ISortingExpressionProvider<HospitalViewModel, Hospital>
    {
        private static readonly Dictionary<string, Expression<Func<Hospital, object>>> s_expressions = new()
        {
            { "name", hospital => hospital.Name },
            { "code", hospital => hospital.HospitalCode ?? string.Empty },
            { "createdat", hospital => hospital.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Hospital, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
