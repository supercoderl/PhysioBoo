namespace PhysioBoo.SharedKernel.Attributes
{
    // Attributes for table mapping
    [AttributeUsage(AttributeTargets.Class)]
    public class TableAttribute : Attribute
    {
        public string Name { get; }
        public TableAttribute(string name) => Name = name;
    }
}
