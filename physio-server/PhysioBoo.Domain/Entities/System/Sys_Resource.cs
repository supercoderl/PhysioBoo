using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_Resource : Entity
    {
        public string Key { get; private set; }
        public Guid LanguageId { get; private set; }
        public string Value { get; private set; }

        [ForeignKey("LanguageId")]
        [InverseProperty("Sys_Resources")]
        public virtual Sys_Language? Language { get; set; }

        public Sys_Resource(
            Guid id,
            string key,
            Guid languageId,
            string value
        ) : base(id)
        {
            Key = key;
            LanguageId = languageId;
            Value = value;
        }

        public void SetKey(string key) { Key = key; }
        public void SetLanguageId(Guid languageId) { LanguageId = languageId; }
        public void SetValue(string value) { Value = value; }
    }
}
