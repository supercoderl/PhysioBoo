namespace PhysioBoo.Application.Interfaces
{
    public interface IPrintTemplateRenderer
    {
        string Render(string templateHtml, IReadOnlyDictionary<string, object?> data);
    }
}
