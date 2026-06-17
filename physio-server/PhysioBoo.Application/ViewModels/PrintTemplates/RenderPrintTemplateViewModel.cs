namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed record RenderPrintTemplateViewModel
    (
        string? TemplateCode,
        Guid? TemplateId,
        Dictionary<string, object?> Data
    );
}
