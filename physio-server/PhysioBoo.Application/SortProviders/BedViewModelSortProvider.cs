using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class BedViewModelSortProvider : ISortingExpressionProvider<BedViewModel, Bed>
    {
        private static readonly Dictionary<string, Expression<Func<Bed, object>>> s_expressions = new()
        {
            { "number", x => x.Number }, { "floor", x => x.Floor },
            { "status", x => x.Status }, { "bedtype", x => x.BedType },
            { "wardname", x => x.Ward!.Name },
            { "createdat", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Bed, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
