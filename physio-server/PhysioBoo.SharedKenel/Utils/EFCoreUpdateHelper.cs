using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class EFCoreUpdateHelper
    {
        public static Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>>
            BuildSetPropertiesExpression<TEntity, TUpdateDto>(TUpdateDto updateDto)
        {
            var settersParam = Expression.Parameter(typeof(SetPropertyCalls<TEntity>), "setters");
            var entityParam = Expression.Parameter(typeof(TEntity), "u");

            // Start with the initial setters parameter
            Expression currentSetters = settersParam;

            // Get all properties from the update DTO
            if (updateDto == null)
                throw new ArgumentNullException(nameof(updateDto));

            var properties = updateDto.GetType().GetProperties()
                .Where(prop =>
                {
                    var value = prop.GetValue(updateDto);
                    if (value == null) return false;
                    if (value is string s && string.IsNullOrWhiteSpace(s)) return false;
                    return true;
                })
                .ToList();

            // Build chained SetProperty calls
            foreach (var prop in properties)
            {
                var value = prop.GetValue(updateDto);
                var propType = prop.PropertyType;

                // Build property selector: u => u.PropName
                var memberAccess = Expression.Property(entityParam, prop.Name);
                var propertySelector = Expression.Lambda(memberAccess, entityParam);

                // Build value selector: _ => value
                var valueParam = Expression.Parameter(typeof(TEntity), "_");
                var valueConstant = Expression.Constant(value, propType);
                var valueSelector = Expression.Lambda(valueConstant, valueParam);

                // Get the SetProperty method
                var setPropertyMethod = typeof(SetPropertyCalls<TEntity>)
                    .GetMethods()
                    .Where(m => m.Name == "SetProperty" &&
                               m.GetParameters().Length == 2 &&
                               m.IsGenericMethodDefinition)
                    .First()
                    .MakeGenericMethod(propType);

                // Create method call: currentSetters.SetProperty(propertySelector, valueSelector)
                currentSetters = Expression.Call(
                    currentSetters,
                    setPropertyMethod,
                    propertySelector,
                    valueSelector
                );
            }

            // Return the lambda expression
            return Expression.Lambda<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>>(
                currentSetters,
                settersParam
            );
        }
    }
}
