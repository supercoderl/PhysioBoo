using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Domain.Entities.Core
{
    public class UserPreference : TenantEntity
    {
        #region Core User Preference Table (4)
        public Guid UserId { get; private set; }
        public string Key { get; private set; }
        public string Value { get; private set; }
        public string Group { get; private set; }

        public virtual User? User { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (4)
        public UserPreference(
            Guid id,
            Guid userId,
            string key,
            string value,
            string group
        ) : base(Guid.NewGuid())
        {
            UserId = userId;
            Key = key;
            Value = value;
            Group = group;
        }
        #endregion

        #region Setter Methods (4)
        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetKey(string key) { Key = key; }
        public void SetValue(string value) { Value = value; }
        public void SetGroup(string group) { Group = group; }
        #endregion
    }
}
