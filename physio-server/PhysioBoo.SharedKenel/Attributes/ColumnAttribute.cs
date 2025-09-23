namespace PhysioBoo.SharedKernel.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class ColumnAttribute : Attribute
    {
        public string Name { get; }
        public string TypeName { get; set; } // For JSON columns, etc.

        public ColumnAttribute(string name) => Name = name;
    }
}
