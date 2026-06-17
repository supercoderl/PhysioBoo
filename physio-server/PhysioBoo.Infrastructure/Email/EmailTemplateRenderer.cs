using PhysioBoo.Application.Interfaces;

namespace PhysioBoo.Infrastructure.Email
{
    public class EmailTemplateRenderer : IEmailTemplateRenderer
    {
        public string Render(string templateContent, object model)
        {
            Scriban.Template template = Scriban.Template.Parse(templateContent);
            return template.Render(model, member => member.Name);
        }
    }
}
