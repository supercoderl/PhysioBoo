using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Core;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class PrintTemplate : AuditEntity
    {
        #region Core Print Template Table (20)
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Module { get; private set; }
        public string DocumentType { get; private set; }
        public bool IsSystemDefault { get; private set; }
        public bool IsActive { get; private set; }
        public Guid CurrentVersionId { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual PrintTemplateVersion? PrintTemplateVersion { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }

        public virtual ICollection<PrintTemplateVersion> PrintTemplateVersions { get; private set; } = new List<PrintTemplateVersion>();
        #endregion

        #region Constructor (20)
        public PrintTemplate(
            Guid id,
            string name,
            string code,
            string module,
            string documentType,
            Guid currentVersionId
        ) : base(id)
        {
            Name = name;
            Code = code;
            Module = module;
            DocumentType = documentType;
            IsSystemDefault = false;
            IsActive = true;
            CurrentVersionId = currentVersionId;
        }
        #endregion

        #region Setter Methods (20)
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetModule(string module) { Module = module; }
        public void SetDocumentType(string documentType) { DocumentType = documentType; }
        public void SetIsDefault(bool isSystemDefault) { IsSystemDefault = isSystemDefault; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCurrentVersionId(Guid currentVersionId) { CurrentVersionId = currentVersionId; }
        #endregion
    }
}
