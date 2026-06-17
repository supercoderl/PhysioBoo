using PhysioBoo.Application.ViewModels.PrintTemplateVersions;

namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed record CreatePrintTemplateViewModel
    (
        string Name,
        string Code,
        string Module,
        string DocumentType,
        CreatePrintTemplateVersionViewModel Version
    );
}
