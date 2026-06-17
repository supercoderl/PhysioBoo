namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    /// <summary>
    /// Represents filter criteria when querying print templates.
    /// </summary>
    public sealed record PrintTemplateFilter
    (
        string Start,
        string End
    );
}
