using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_Language : Entity
    {
        public string Code { get; private set; }
        public string Name { get; private set; }
        public bool IsActive { get; private set; }

        [InverseProperty("Language")]
        public virtual ICollection<Sys_Resource> Sys_Resources { get; set; } = new HashSet<Sys_Resource>();

        public Sys_Language(
            Guid id,
            string code,
            string name
        ) : base(id)
        {
            Code = code;
            Name = name;
            IsActive = true;
        }

        public void SetCode(string code) { Code = code; }
        public void SetName(string name) { Name = name; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }
}
