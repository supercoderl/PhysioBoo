namespace PhysioBoo.SharedKernel.Attributes
{
    /// <summary>
    /// Decorates a property inside a [PlaceholderGroup] class with display metadata.
    /// Optional: properties without this attribute still appear, using auto-derived label/key.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, Inherited = false)]
    public sealed class PlaceholderAttribute : Attribute
    {
        /// <summary>Override the auto-derived key. Defaults to "{groupBase}.{propertyNameCamelCase}".</summary>
        public string? Key { get; init; }

        /// <summary>Human-readable label shown next to the placeholder. Defaults to property name with spaces.</summary>
        public string? Label { get; init; }

        /// <summary>Example value shown in the preview's "Sample data" mode.</summary>
        public string? Example { get; init; }
    }
}
