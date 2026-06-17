using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using System.Net;
using System.Net.Mail;

namespace PhysioBoo.Infrastructure.Email
{
    public sealed class SmtpEmailSender : IEmailSender
    {
        private readonly IEmailTemplateProvider _provider;
        private readonly IEmailTemplateRenderer _renderer;
        private readonly MailSettings _mail;

        public SmtpEmailSender(
            IEmailTemplateProvider provider,
            IEmailTemplateRenderer renderer,
            IOptions<MailSettings> options
        )
        {
            _provider = provider;
            _renderer = renderer;
            _mail = options.Value;
        }

        public async Task SendTemplateAsync(string to, string templateKey, object model, string subject)
        {
            string templateContent = _provider.GetTemplate(templateKey);
            string html = _renderer.Render(templateContent, model);

            await SendAsync(to, subject, html, true);
        }

        private async Task SendAsync(string to, string subject, string body, bool isHtml)
        {
            try
            {
                SmtpClient client = new SmtpClient("smtp.gmail.com")
                {
                    Port = _mail.Port,
                    Credentials = new NetworkCredential(_mail.Username, _mail.Password),
                    EnableSsl = _mail.EnableSSL
                };

                MailMessage mail = new MailMessage
                {
                    From = new MailAddress(_mail.Username, _mail.DisplayName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };
                mail.To.Add(to);

                await client.SendMailAsync(mail);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
