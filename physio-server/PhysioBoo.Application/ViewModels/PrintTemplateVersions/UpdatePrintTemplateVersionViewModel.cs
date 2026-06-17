using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PrintTemplateVersions
{
    public sealed record UpdatePrintTemplateVersionViewModel
    (
        int VersionNumber,
        PrintPaperSize PaperSize,
        PrintOrientation Orientation,
        string HeaderHtml,
        string BodyHtml,
        string FooterHtml,
        string CustomCss
    );
}
