using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;
using System.Reflection;

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

        public static Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>>
            BuildSetPropertiesExpressionFromEntity<TEntity>(TEntity entity)
        {
            var parameter = Expression.Parameter(typeof(SetPropertyCalls<TEntity>), "setPropertyCalls");
            var entityType = typeof(TEntity);

            // Get properties to update
            var properties = entityType.GetProperties()
                .Where(p => p.CanRead && p.CanWrite && !IsNavigationProperty(p))
                .Where(p => p.GetValue(entity) != null) // Only properties with non-null values
                .ToList();

            if (!properties.Any())
            {
                // If no properties to update, return the parameter as-is
                return Expression.Lambda<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>>(
                    parameter, parameter);
            }

            // Build the chain of SetProperty calls
            Expression currentExpression = parameter;

            foreach (var property in properties)
            {
                var value = property.GetValue(entity);

                // Create lambda for property selector: x => x.PropertyName
                var entityParam = Expression.Parameter(typeof(TEntity), "x");
                var propertyAccess = Expression.Property(entityParam, property);
                var propertySelector = Expression.Lambda(propertyAccess, entityParam);

                // Create constant for the value
                var valueConstant = Expression.Constant(value, property.PropertyType);

                // Find the SetProperty method
                var setPropertyMethod = typeof(SetPropertyCalls<TEntity>)
                    .GetMethods()
                    .Where(m => m.Name == "SetProperty" && m.IsGenericMethodDefinition)
                    .FirstOrDefault()
                    ?.MakeGenericMethod(property.PropertyType);

                if (setPropertyMethod == null)
                    throw new InvalidOperationException($"SetProperty method not found for type {property.PropertyType}");

                // Create the method call: currentExpression.SetProperty(propertySelector, value)
                currentExpression = Expression.Call(
                    currentExpression,
                    setPropertyMethod,
                    propertySelector,
                    valueConstant);
            }

            return Expression.Lambda<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>>(
                currentExpression, parameter);
        }

        private static bool IsNavigationProperty(PropertyInfo property)
        {
            return property.PropertyType.IsClass &&
                   property.PropertyType != typeof(string) &&
                   !property.PropertyType.IsValueType;
        }
    }
}
