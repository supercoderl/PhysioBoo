using PhysioBoo.Application.ViewModels.PrintTemplateVersions;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed class PrintTemplateViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public bool IsSystemDefault { get; set; }
        public bool IsActive { get; set; }
        public Guid? CurrentVersionId { get; set; }
        public PrintTemplateVersionViewModel CurrentVersion { get; set; } = new PrintTemplateVersionViewModel();

        public static PrintTemplateViewModel FromPrintTemplate(PrintTemplate printTemplate)
        {
            return new PrintTemplateViewModel
            {
                Id = printTemplate.Id,
                Name = printTemplate.Name,
                Code = printTemplate.Code,
                Module = printTemplate.Module,
                DocumentType = printTemplate.DocumentType,
                IsSystemDefault = printTemplate.IsSystemDefault,
                IsActive = printTemplate.IsActive,
                CurrentVersionId = printTemplate.CurrentVersionId,
                CurrentVersion = printTemplate.PrintTemplateVersion != null ? PrintTemplateVersionViewModel.FromPrintTemplateVersion(printTemplate.PrintTemplateVersion) : new PrintTemplateVersionViewModel()
            };
        }
    }

    public sealed class PrintTemplateRender
    {
        public string Html { get; set; }
        public PrintPaperSize PaperSize { get; set; }
        public PrintOrientation Orientation { get; set; }
        public string CustomCss { get; set; }

        public PrintTemplateRender(
            string html,
            PrintPaperSize paperSize,
            PrintOrientation orientation,
            string customCss
        )
        {
            Html = html;
            PaperSize = paperSize;
            Orientation = orientation;
            CustomCss = customCss;
        }
    }
}
