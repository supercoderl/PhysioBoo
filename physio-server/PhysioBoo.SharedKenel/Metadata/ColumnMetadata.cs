using System.Reflection;

namespace PhysioBoo.SharedKernel.Metadata
{
    public class ColumnMetadata
    {
        public string PropertyName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public Type PropertyType { get; set; } = typeof(string);
        public bool IsKey { get; set; }
        public bool IsGenerated { get; set; }
        public bool IsComputed { get; set; }
        public PropertyInfo Property { get; set; } 
    }
}
