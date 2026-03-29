namespace PhysioBoo.SharedKernel.Attributes
{
    [AttributeUsage(AttributeTargets.Field)]
    public class RoleMetadataAttribute : Attribute
    {
        public string Name { get; }
        public string Description { get; }
        public bool IsSystemRole { get; }
        public bool IsPublicForRegistration { get; }

        public RoleMetadataAttribute(string name, string description, bool isSystemRole = false, bool isPublicForRegistration = false)
        {
            Name = name;
            Description = description;
            IsSystemRole = isSystemRole;
            IsPublicForRegistration = isPublicForRegistration;
        }
    }
}
