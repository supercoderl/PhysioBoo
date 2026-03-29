namespace PhysioBoo.SharedKernel.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public sealed class PrintTagAttribute : Attribute
    {
        public string Label { get; }
        public PrintTagAttribute(string label) => Label = label;
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class PrintCollectionAttribute : Attribute
    {
        public string CollectionName { get; }
        public PrintCollectionAttribute(string name) => CollectionName = name;
    }
}
