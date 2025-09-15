using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;

namespace PhysioBoo.Infrastructure.Database
{
    public static class DbContextUtility
    {
        public const string IsDeleteProperty = "DeletedAt";

        public static readonly MethodInfo PropertyMethod = typeof(EF).GetMethod(nameof(EF.Property), BindingFlags.Static | BindingFlags.Public)!.MakeGenericMethod(typeof(DateTimeOffset?));

        public static LambdaExpression GetIsDeletedRestriction(Type type)
        {
            var parm = Expression.Parameter(type, "it");
            var prop = Expression.Call(PropertyMethod, parm, Expression.Constant(IsDeleteProperty));
            var condition = Expression.MakeBinary(ExpressionType.Equal, prop, Expression.Constant(null));
            var lambda = Expression.Lambda(condition, parm);
            return lambda;
        }
    }
}
