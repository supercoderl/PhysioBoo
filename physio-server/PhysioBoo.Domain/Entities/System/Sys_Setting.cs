namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_Setting : Entity
    {
        public string Key { get; private set; }
        public string Value { get; private set; }
        public string? Description { get; private set; }
        public string Group { get; private set; }
        public bool IsSystem { get; private set; }
        public string InputType { get; private set; }
        public bool IsEncrypted { get; private set; }

        public Sys_Setting(
            Guid id,
            string key,
            string value,
            string? description,
            string group,
            bool isSystem,
            string inputType
        ) : base(id)
        {
            Key = key;
            Value = value;
            Description = description;
            Group = group;
            IsSystem = isSystem;
            InputType = inputType;
            IsEncrypted = false;
        }

        public void SetKey(string key) { Key = key; }
        public void SetValue(string value) { Value = value; }
        public void SetDescription(string? description) { Description = description; }
        public void SetGroup(string group) { Group = group; }
        public void SetIsSystem(bool isSystem) { IsSystem = isSystem; }
        public void SetInputType(string inputType) { InputType = inputType; }
        public void SetIsEncrypted(bool isEncrypted) { IsEncrypted = isEncrypted; }
    }
}
