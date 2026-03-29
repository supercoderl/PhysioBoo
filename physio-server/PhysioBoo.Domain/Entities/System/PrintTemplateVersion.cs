using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.System
{
    public class PrintTemplateVersion : AuditEntity
    {
        #region Core Print Template Version Table (20)
        public Guid TemplateId { get; private set; }
        public int VersionNumber { get; private set; }
        public PrintPaperSize PaperSize { get; private set; }
        public PrintOrientation Orientation { get; private set; }
        public string HeaderHtml { get; private set; }
        public string BodyHtml { get; private set; }
        public string FooterHtml { get; private set; }
        public string CustomCss { get; private set; }

        public virtual PrintTemplate? PrintTemplate { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }

        public virtual ICollection<PrintTemplate> PrintTemplates { get; private set; } = new List<PrintTemplate>();
        #endregion

        #region Constructor (20)
        public PrintTemplateVersion(
            Guid id,
            Guid templateId,
            int versionNumber,
            PrintPaperSize paperSize,
            PrintOrientation orientation,
            string headerHtml,
            string bodyHtml,
            string footerHtml,
            string customCss
        ) : base(id)
        {
            TemplateId = templateId;
            VersionNumber = versionNumber;
            PaperSize = paperSize;
            Orientation = orientation;
            HeaderHtml = headerHtml;
            BodyHtml = bodyHtml;
            FooterHtml = footerHtml;
            CustomCss = customCss;
        }
        #endregion

        #region Setter Methods (20)
        public void SetTemplateId(Guid templateId) { TemplateId = templateId; }
        public void SetVersionNumber(int versionNumber) { VersionNumber = versionNumber; }
        public void SetPaperSize(PrintPaperSize paperSize) { PaperSize = paperSize; }
        public void SetOrientation(PrintOrientation orientation) { Orientation = orientation; }
        public void SetHeaderHtml(string headerHtml) { HeaderHtml = headerHtml; }
        public void SetBodyHtml(string bodyHtml) { BodyHtml = bodyHtml; }
        public void SetFooterHtml(string footerHtml) { FooterHtml = footerHtml; }
        public void SetCustomCss(string customCss) { CustomCss = customCss; }
        #endregion
    }
}
