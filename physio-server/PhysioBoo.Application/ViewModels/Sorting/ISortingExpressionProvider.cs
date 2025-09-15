using System.Linq.Expressions;

namespace PhysioBoo.Application.ViewModels.Sorting
{
    public interface ISortingExpressionProvider<TViewModel, TEntity>
    {
        Dictionary<string, Expression<Func<TEntity, object>>> GetSortingExpressions();
    }
}
