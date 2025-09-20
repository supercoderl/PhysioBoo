namespace PhysioBoo.Infrastructure.Email
{
    public interface IEmailTemplateRenderer
    {
        string Render(string templateContent, object model);
    }

    public class ScribanEmailTemplateRenderer : IEmailTemplateRenderer
    {
        public string Render(string templateContent, object model)
        {
            var template = Scriban.Template.Parse(templateContent);
            return template.Render(model, member => member.Name);
        }
    }
}
