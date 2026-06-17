namespace PhysioBoo.Application.Interfaces
{
    public interface IEmailTemplateRenderer
    {
        string Render(string templateContent, object model);
    }
}
