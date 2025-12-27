using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.Core
{
    public sealed class SystemSetting : Entity
    {
        #region Core System Setting Table (9)
        public string Key { get; private set; }
        public string Group { get; private set; }
        public string Value { get; private set; }
        public DataType ValueType { get; private set; }
        public string? Description { get; private set; }
        public bool IsEditable { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        #endregion

        #region Constructor(9)
        public SystemSetting(
            Guid id,
            string key,
            string group,
            string value,
            DataType valueType,
            string? description,
            bool isEditable
        ) : base(id)
        {
            Key = key;
            Group = group;
            Value = value;
            ValueType = valueType;
            Description = description;
            IsEditable = isEditable;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (9)
        public void SetKey(string key) { Key = key; }
        public void SetGroup(string group) { Group = group; }
        public void SetValue(string value) { Value = value; }
        public void SetValueType(DataType valueType) { ValueType = valueType; }
        public void SetDescription(string? description) { Description = description; }
        public void SetIsEditable(bool isEditable) { IsEditable = isEditable; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdateAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
