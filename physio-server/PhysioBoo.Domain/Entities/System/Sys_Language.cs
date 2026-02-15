using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_Language : Entity
    {
        public string Code { get; private set; }
        public string Name { get; private set; }
        public bool IsActive { get; private set; }
        public string? FlagUrl { get; private set; }
        public bool IsDefault { get; private set; }
        public string? NativeName { get; private set; }
        public int Index { get; private set; }

        [InverseProperty("Language")]
        public virtual ICollection<Sys_Resource> Sys_Resources { get; set; } = new HashSet<Sys_Resource>();

        public Sys_Language(
            Guid id,
            string code,
            string name,
            string? flagUrl,
            bool isDefault,
            string? nativeName,
            int index
        ) : base(id)
        {
            Code = code;
            Name = name;
            IsActive = true;
            FlagUrl = flagUrl;
            IsDefault = isDefault;
            NativeName = nativeName;
            Index = index;
        }

        public void SetCode(string code) { Code = code; }
        public void SetName(string name) { Name = name; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetFlagUrl(string? flagUrl) { FlagUrl = flagUrl; }
        public void SetIsDefault(bool isDefault) { IsDefault = isDefault; }
        public void SetNativeName(string? nativeName) { NativeName = nativeName; }
        public void SetIndex(int index) { Index = index; }
    }
}
