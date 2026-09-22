using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class MedicalServiceViewModelSortProvider : ISortingExpressionProvider<MedicalServiceViewModel, MedicalService>
    {
        private static readonly Dictionary<string, Expression<Func<MedicalService, object>>> s_expressions = new()
        {
            { "name", x => x.Name }, { "code", x => x.Code }, { "baseprice", x => x.BasePrice },
            { "createdat", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt },
            { "popularity.totalappointments", x => x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<MedicalService, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
