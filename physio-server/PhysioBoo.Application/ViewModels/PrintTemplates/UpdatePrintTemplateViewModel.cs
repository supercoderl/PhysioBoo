namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed record UpdatePrintTemplateViewModel
    (
        string Name,
        string Code,
        string Module,
        string DocumentType,
        bool IsActive,
        bool IsSystemDefault
    );
}
