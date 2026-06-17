namespace PhysioBoo.Application.Interfaces
{
    public interface IEmailSender
    {
        Task SendTemplateAsync(string to, string templateKey, object model, string subject);
    }
}
