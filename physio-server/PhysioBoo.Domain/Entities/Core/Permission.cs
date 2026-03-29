namespace PhysioBoo.Domain.Entities.Core
{
    public class Permission : Entity
    {
        #region Core Permission Table (3)
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string? Description { get; private set; }

        public virtual ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();
        #endregion

        #region Constructor (3)
        public Permission(
            Guid id,
            string name,
            string code,
            string? description
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
        }
        #endregion

        #region Setter Methods (3)
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        #endregion
    }
}
