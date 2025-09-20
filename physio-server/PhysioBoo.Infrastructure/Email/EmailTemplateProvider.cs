using Microsoft.Extensions.Hosting;

namespace PhysioBoo.Infrastructure.Email
{
    public interface IEmailTemplateProvider
    {
        string GetTemplate(string templateKey);
    }

    public class FileEmailTemplateProvider : IEmailTemplateProvider
    {
        public FileEmailTemplateProvider(IHostEnvironment env)
        {

        }

        public string GetTemplate(string templateKey)
        {
            // Find the solution root by looking for the .sln file
            var currentDirectory = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);

            while (currentDirectory != null && !currentDirectory.GetFiles("*.sln").Any())
            {
                currentDirectory = currentDirectory.Parent;
            }

            if (currentDirectory == null)
                throw new DirectoryNotFoundException("Could not find solution root directory");

            var templatePath = Path.Combine(currentDirectory.FullName,
                                           "PhysioBoo.Infrastructure", "Email", "Templates",
                                           $"{templateKey}.html");
            if (!File.Exists(templatePath))
                throw new FileNotFoundException($"Email template '{templateKey}' not found at {templatePath}");
            return File.ReadAllText(templatePath);
        }
    }
}
