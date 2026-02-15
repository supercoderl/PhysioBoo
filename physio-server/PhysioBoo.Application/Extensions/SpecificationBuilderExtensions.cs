using Ardalis.Specification;
using PhysioBoo.Application.ViewModels.Sorting;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Extensions
{
    public static class SpecificationBuilderExtensions
    {
        public static ISpecificationBuilder<TEntity> ApplySorting<TEntity, TViewModel>(
            this ISpecificationBuilder<TEntity> builder,
            SortQuery? sort,
            ISortingExpressionProvider<TViewModel, TEntity> sortingProvider)
        {
            if (sort is null || !sort.Parameters.Any())
            {
                return builder;
            }

            Dictionary<string, Expression<Func<TEntity, object>>> fieldExpressions = sortingProvider.GetSortingExpressions();
            IOrderedSpecificationBuilder<TEntity>? orderedBuilder = null;

            for (int i = 0; i < sort.Parameters.Count; i++)
            {
                SortParameter param = sort.Parameters[i];

                if (fieldExpressions.TryGetValue(param.ParameterName, out Expression<Func<TEntity, object>>? expression))
                {
                    if (orderedBuilder == null)
                    {
                        if (param.Order == SortOrder.Descending)
                            orderedBuilder = builder.OrderByDescending(expression!);
                        else
                            orderedBuilder = builder.OrderBy(expression!);
                    }
                    else
                    {
                        if (param.Order == SortOrder.Descending)
                            orderedBuilder.ThenByDescending(expression!);
                        else
                            orderedBuilder.ThenBy(expression!);
                    }
                }
            }

            return builder;
        }
    }
}
