using Dapper;
using Npgsql;
using NpgsqlTypes;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Metadata;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using static Npgsql.Replication.PgOutput.Messages.RelationMessage;
using ColumnAttribute = PhysioBoo.SharedKernel.Attributes.ColumnAttribute;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class SqlHelper
    {
        /// <summary>
        /// Comprehensive check to determine if a property should be included in database operations
        /// </summary>
        public static bool ShouldIncludeProperty(PropertyInfo property)
        {
            // Must be readable
            if (!property.CanRead)
                return false;

            // Skip properties explicitly marked with [Ignore] or [NotMapped]
            if (property.GetCustomAttributes<IgnoreAttribute>().Any() ||
                property.GetCustomAttributes<NotMappedAttribute>().Any())
                return false;

            // Skip properties with [InverseProperty] - these are EF navigation properties
            if (property.GetCustomAttribute<InversePropertyAttribute>() != null)
                return false;

            // Skip collection properties
            if (IsCollectionProperty(property))
                return false;

            // Skip navigation properties (complex object types that aren't primitives/supported types)
            if (IsNavigationProperty(property))
                return false;

            // Only include properties with supported data types
            if (!IsSupportedProperty(property))
                return false;

            // This catches many EF navigation properties
            if (!property.CanWrite && property.GetCustomAttribute<ColumnAttribute>() == null)
            {
                if (IsNavigationProperty(property))
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Enhanced navigation property detection for Entity Framework
        /// </summary>
        private static bool IsNavigationProperty(PropertyInfo property)
        {
            var propertyType = property.PropertyType;
            var underlyingType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            // If it's a primitive type, DateTime, string, etc., it's not a navigation property
            if (IsPrimitiveOrValueType(underlyingType))
                return false;

            // Check if it has virtual keyword and is a complex type (likely navigation property)
            if (property.GetMethod?.IsVirtual == true && !underlyingType.IsPrimitive && underlyingType != typeof(string))
                return true;

            // Check if there's a corresponding foreign key property
            var declaringType = property.DeclaringType;
            if (declaringType != null)
            {
                // Look for foreign key properties that reference this navigation property
                var foreignKeyProperty = declaringType.GetProperties()
                    .FirstOrDefault(p => p.GetCustomAttribute<ForeignKeyAttribute>()?.Name == property.Name);

                if (foreignKeyProperty != null)
                    return true;

                // Also check if this property name + "Id" exists (convention-based FK)
                var conventionalFKName = property.Name + "Id";
                var conventionalFK = declaringType.GetProperty(conventionalFKName);
                if (conventionalFK != null && IsPrimitiveOrValueType(conventionalFK.PropertyType))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Check if type is primitive or commonly used value type
        /// </summary>
        private static bool IsPrimitiveOrValueType(Type type)
        {
            return type.IsPrimitive ||
                   type == typeof(string) ||
                   type == typeof(DateTime) ||
                   type == typeof(DateOnly) ||
                   type == typeof(TimeOnly) ||
                   type == typeof(TimeSpan) ||
                   type == typeof(decimal) ||
                   type == typeof(Guid) ||
                   type.IsEnum ||
                   type == typeof(byte[]);
        }

        // <summary>
        /// Check if property is a collection (ICollection, IList, etc.)
        /// </summary>
        private static bool IsCollectionProperty(PropertyInfo property)
        {
            var propertyType = property.PropertyType;

            if (propertyType == typeof(string))
                return false;

            if (propertyType.IsArray)
            {
                var elementType = propertyType.GetElementType();
                if (elementType != null && IsSupportedPropertyType(elementType))
                    return false;
            }

            // Remove generic collections (List<T>, ICollection<T>, IEnumerable<T>, …)
            if (propertyType.IsGenericType)
            {
                var genericDef = propertyType.GetGenericTypeDefinition();
                if (genericDef == typeof(List<>) ||
                    genericDef == typeof(IList<>) ||
                    genericDef == typeof(ICollection<>) ||
                    genericDef == typeof(IEnumerable<>))
                {
                    return true;
                }
            }

            return typeof(System.Collections.IEnumerable).IsAssignableFrom(propertyType);
        }

        // <summary>
        /// Check if the property type is supported for database operations
        /// </summary>
        private static bool IsSupportedPropertyType(Type propertyType)
        {
            var underlyingType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            // Check for array types first
            if (IsArrayType(underlyingType))
            {
                // Get the element type of the array
                Type? elementType = underlyingType.IsArray
                    ? underlyingType.GetElementType()
                    : underlyingType.GetGenericArguments()[0];

                if (elementType == null) return false;

                // Check if the element type is supported
                return IsSupportedPropertyType(elementType);
            }

            return underlyingType.IsPrimitive ||
                   underlyingType == typeof(string) ||
                   underlyingType == typeof(DateTime) ||
                   underlyingType == typeof(DateOnly) ||
                   underlyingType == typeof(TimeOnly) ||
                   underlyingType == typeof(TimeSpan) ||
                   underlyingType == typeof(decimal) ||
                   underlyingType == typeof(Guid) ||
                   underlyingType.IsEnum ||
                   underlyingType == typeof(byte[]);
        }

        /// <summary>
        /// Check if a property represents a generated column (Identity, Computed, etc.)
        /// </summary>
        public static bool IsGeneratedColumn(PropertyInfo property)
        {
            // Check for explicit attributes first
            if (property.GetCustomAttribute<GeneratedColumnAttribute>() != null)
                return true;

            var dbGeneratedAttr = property.GetCustomAttribute<DatabaseGeneratedAttribute>();
            if (dbGeneratedAttr != null)
            {
                return dbGeneratedAttr.DatabaseGeneratedOption == DatabaseGeneratedOption.Identity ||
                       dbGeneratedAttr.DatabaseGeneratedOption == DatabaseGeneratedOption.Computed;
            }

            // Check for common naming patterns of generated columns
            var propertyName = property.Name.ToLower();
            var commonGeneratedNames = new[]
            {
                "rowversion", "timestamp",
                "emailnormalized", "usernamenormalized", "phonenormalized",
                "searchvector", "fulltext", "computedcolumn"
            };

            return commonGeneratedNames.Any(name => propertyName.Contains(name));
        }

        /// <summary>
        /// Check if a property represents a computed column specifically
        /// </summary>
        public static bool IsComputedColumn(PropertyInfo property)
        {
            // Check for explicit attribute first
            if (property.GetCustomAttribute<ComputedColumnAttribute>() != null)
                return true;

            var dbGeneratedAttr = property.GetCustomAttribute<DatabaseGeneratedAttribute>();
            if (dbGeneratedAttr?.DatabaseGeneratedOption == DatabaseGeneratedOption.Computed)
                return true;

            // Check for computed column indicators in column attribute
            var columnAttr = property.GetCustomAttribute<ColumnAttribute>();
            if (columnAttr?.TypeName?.ToLower().Contains("generated") == true)
                return true;

            // Check for common computed column naming patterns
            var propertyName = property.Name.ToLower();
            var computedPatterns = new[]
            {
                "normalized", "computed", "calculated", "generated",
                "fullname", "displayname", "searchtext", "vector"
            };

            return computedPatterns.Any(pattern => propertyName.Contains(pattern));
        }

        private static bool IsSupportedProperty(PropertyInfo property)
        {
            var propertyType = property.PropertyType;

            // Check basic type support first
            if (!IsSupportedPropertyType(propertyType))
                return false;

            // Additional check for JSON properties
            var columnAttribute = property.GetCustomAttribute<ColumnAttribute>();
            if (propertyType == typeof(string) &&
                columnAttribute?.TypeName?.ToLower().Contains("json") == true)
            {
                return true; // JSON columns are supported as strings
            }

            return true;
        }

        /// <summary>
        /// Check if a type is a jsonb type
        /// </summary>
        public static bool IsJsonbType(ColumnMetadata? column)
        {
            var colAttr = column?.Property?.GetCustomAttribute<ColumnAttribute>();
            var typeName = colAttr?.TypeName;
            var result = string.Equals(typeName, "jsonb", StringComparison.OrdinalIgnoreCase);

            // Debug logging - remove after fixing
            Console.WriteLine($"Column: {column?.ColumnName}, TypeName: '{typeName}', IsJsonb: {result}");

            return result;
        }

        /// <summary>
        /// Check if a type is an array type
        /// </summary>
        public static bool IsArrayType(Type type)
        {
            return type.IsArray ||
                   (type.IsGenericType &&
                    (type.GetGenericTypeDefinition() == typeof(List<>) ||
                     type.GetGenericTypeDefinition() == typeof(IList<>) ||
                     type.GetGenericTypeDefinition() == typeof(ICollection<>)));
        }

        /// <summary>
        /// Check if an array is empty
        /// </summary>
        public static bool IsEmptyArray(object arrayValue)
        {
            if (arrayValue is Array array)
                return array.Length == 0;

            if (arrayValue is System.Collections.ICollection collection)
                return collection.Count == 0;

            return false;
        }

        /// <summary>
        /// Get the element type of an array
        /// </summary>
        public static Type? GetArrayElementType(Type arrayType)
        {
            if (arrayType.IsArray)
                return arrayType.GetElementType();

            if (arrayType.IsGenericType)
                return arrayType.GetGenericArguments()[0];

            return typeof(object);
        }

        /// <summary>
        /// Create a typed empty array
        /// </summary>
        public static object CreateTypedEmptyArray(Type? elementType)
        {
            if (elementType == null)
                throw new ArgumentNullException(nameof(elementType), "Element type cannot be null.");

            return Array.CreateInstance(elementType, 0);
        }

        /// <summary>
        /// Get DbType based on the actual value (more reliable than type-only)
        /// </summary>
        public static DbType? GetDbTypeForValue(object value)
        {
            if (value == null) return null;

            return value switch
            {
                short => DbType.Int16,
                int => DbType.Int32,
                long => DbType.Int64,
                string => DbType.String,
                DateTime => DbType.DateTime,
                bool => DbType.Boolean,
                decimal => DbType.Decimal,
                double => DbType.Double,
                float => DbType.Single,
                Guid => DbType.Guid,
                TimeSpan => DbType.Time,
                byte => DbType.Byte,
                sbyte => DbType.SByte,
                ushort => DbType.UInt16,
                uint => DbType.UInt32,
                ulong => DbType.UInt64,
                byte[] => DbType.Binary,
                _ when value.GetType().IsEnum => DbType.Int32,
                _ => null // Let Dapper determine
            };
        }

        /// <summary>
        /// Get the appropriate NpgsqlDbType for array columns with better error handling
        /// </summary>
        public static NpgsqlTypes.NpgsqlDbType GetArrayNpgsqlDbType(Type arrayType)
        {
            try
            {
                Type? elementType = GetArrayElementType(arrayType);
                var baseType = GetNpgsqlDbType(elementType);
                return NpgsqlTypes.NpgsqlDbType.Array | baseType;
            }
            catch
            {
                // Fallback to text array if we can't determine the exact type
                return NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Text;
            }
        }

        /// <summary>
        /// Enhanced GetNpgsqlDbType with better type support
        /// </summary>
        private static NpgsqlTypes.NpgsqlDbType GetNpgsqlDbType(Type? type)
        {
            if (type is null) return NpgsqlTypes.NpgsqlDbType.Text;

            var underlyingType = Nullable.GetUnderlyingType(type) ?? type;

            return underlyingType.Name switch
            {
                nameof(Int16) => NpgsqlTypes.NpgsqlDbType.Smallint,
                nameof(Int32) => NpgsqlTypes.NpgsqlDbType.Integer,
                nameof(Int64) => NpgsqlTypes.NpgsqlDbType.Bigint,
                nameof(String) => NpgsqlTypes.NpgsqlDbType.Text,
                nameof(DateTime) => NpgsqlTypes.NpgsqlDbType.Timestamp,
                nameof(DateOnly) => NpgsqlTypes.NpgsqlDbType.Date,
                nameof(TimeOnly) => NpgsqlTypes.NpgsqlDbType.Time,
                nameof(Boolean) => NpgsqlTypes.NpgsqlDbType.Boolean,
                nameof(Decimal) => NpgsqlTypes.NpgsqlDbType.Numeric,
                nameof(Double) => NpgsqlTypes.NpgsqlDbType.Double,
                nameof(Single) => NpgsqlTypes.NpgsqlDbType.Real,
                nameof(Guid) => NpgsqlTypes.NpgsqlDbType.Uuid,
                nameof(Byte) => NpgsqlTypes.NpgsqlDbType.Smallint,
                nameof(TimeSpan) => NpgsqlTypes.NpgsqlDbType.Time,
                _ when underlyingType.IsEnum => NpgsqlTypes.NpgsqlDbType.Integer,
                _ when underlyingType == typeof(byte[]) => NpgsqlTypes.NpgsqlDbType.Bytea,
                _ => NpgsqlTypes.NpgsqlDbType.Text
            };
        }

        /// <summary>
        /// Convert array to PostgreSQL array format: {value1,value2,value3}
        /// </summary>
        public static string ConvertArrayToPostgreSqlFormat(object arrayValue)
        {
            if (arrayValue == null)
                return "{}";

            var enumerable = arrayValue as System.Collections.IEnumerable;
            if (enumerable == null)
                return "{}";

            var elements = new List<string>();
            foreach (var item in enumerable)
            {
                if (item == null)
                {
                    elements.Add("NULL");
                }
                else if (item is string str)
                {
                    // Escape quotes and wrap in quotes for string elements
                    elements.Add($"\"{str.Replace("\"", "\\\"")}\"");
                }
                else
                {
                    elements.Add(ConvertToString(item));
                }
            }

            return "{" + string.Join(",", elements) + "}";
        }

        public static string ConvertToString(object value)
        {
            if (value == null) return "";

            // Handle arrays for PostgreSQL
            if (value.GetType().IsArray || (value.GetType().IsGenericType &&
                typeof(System.Collections.IEnumerable).IsAssignableFrom(value.GetType())))
            {
                return ConvertArrayToPostgreSqlFormat(value);
            }

            return value switch
            {
                DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
                DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd"),
                TimeOnly timeOnly => timeOnly.ToString("HH:mm:ss"),
                TimeSpan ts => ts.ToString(@"hh\:mm\:ss"),
                bool b => b.ToString().ToLower(),
                decimal dec => dec.ToString("F"),
                double dbl => dbl.ToString("F"),
                float flt => flt.ToString("F"),
                _ => value.ToString()
            } ?? string.Empty;
        }

        public static void AddNpgsql<T>(
            this DynamicParameters parameters,
            string name,
            T value,
            NpgsqlDbType npgsqlType
        )
        {
            var p = new NpgsqlParameter(name, npgsqlType) { Value = (object?)value ?? DBNull.Value };
            parameters.Add(name, p.Value, DbType.Object);
        }
    }
}
