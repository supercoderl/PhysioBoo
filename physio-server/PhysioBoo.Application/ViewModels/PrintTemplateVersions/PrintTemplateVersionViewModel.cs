using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PrintTemplateVersions
{
    public sealed class PrintTemplateVersionViewModel
    {
        public Guid Id { get; set; }
        public Guid TemplateId { get; set; }
        public int VersionNumber { get; set; }
        public PrintPaperSize PaperSize { get; set; }
        public PrintOrientation Orientation { get; set; }
        public string HeaderHtml { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public string FooterHtml { get; set; } = string.Empty;
        public string CustomCss { get; set; } = string.Empty;

        public static PrintTemplateVersionViewModel FromPrintTemplateVersion(PrintTemplateVersion printTemplateVersion)
        {
            return new PrintTemplateVersionViewModel
            {
                Id = printTemplateVersion.Id,
                TemplateId = printTemplateVersion.TemplateId,
                VersionNumber = printTemplateVersion.VersionNumber,
                PaperSize = printTemplateVersion.PaperSize,
                Orientation = printTemplateVersion.Orientation,
                HeaderHtml = printTemplateVersion.HeaderHtml,
                BodyHtml = printTemplateVersion.BodyHtml,
                FooterHtml = printTemplateVersion.FooterHtml,
                CustomCss = printTemplateVersion.CustomCss
            };
        }
    }
}
