namespace PhysioBoo.SharedKernel.Attributes
{
    /// <summary>
    /// Marks a class as a placeholder group, surfaced to the print-template designer
    /// under a category header. Properties on the class become individual placeholders.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public sealed class PlaceholderGroupAttribute : Attribute
    {
        /// <summary>Display label for the group, e.g. "Patient".</summary>
        public string Name { get; }

        /// <summary>Base key prefix prepended to property paths. E.g. "patient" → "patient.name".</summary>
        public string Base { get; }

        /// <summary>
        /// Modules this group belongs to. Empty array = universal (shows in every module).
        /// e.g. ["billing"], ["clinical","pharmacy"].
        /// </summary>
        public string[] Modules { get; init; } = Array.Empty<string>();

        /// <summary>Sort order in the designer palette. Lower comes first.</summary>
        public int Order { get; init; } = 100;

        public PlaceholderGroupAttribute(string name, string @base)
        {
            Name = name;
            Base = @base;
        }
    }
}
