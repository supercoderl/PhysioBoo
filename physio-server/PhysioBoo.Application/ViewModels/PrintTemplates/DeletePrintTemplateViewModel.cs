namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed record DeletePrintTemplateViewModel
    (
        Guid Id,
        bool IsHard
    );
}
