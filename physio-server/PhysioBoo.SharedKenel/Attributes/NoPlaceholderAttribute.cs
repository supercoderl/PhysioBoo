namespace PhysioBoo.SharedKernel.Attributes
{
    /// <summary>Skip this property when discovering placeholders.</summary>
    [AttributeUsage(AttributeTargets.Property, Inherited = false)]
    public sealed class NoPlaceholderAttribute : Attribute { }
}
