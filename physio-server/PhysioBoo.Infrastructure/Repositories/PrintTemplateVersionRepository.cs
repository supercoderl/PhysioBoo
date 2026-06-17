using Npgsql;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrintTemplateVersionRepository : BaseRepository<PrintTemplateVersion>, IPrintTemplateVersionRepository
    {
        private readonly ApplicationDbContext _context;

        public PrintTemplateVersionRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PrintTemplateVersion?> GetByTemplateIdAsync(Guid templateId, CancellationToken cancellationToken)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_template_id"] = templateId
            };

            List<PrintTemplateVersion> result = await ExecutePostgresFunctionAsync<PrintTemplateVersion>(
                "get_print_template_version_by_template_id",
                parameters,
                reader => MapPrintTemplateVersion(reader),
                cancellationToken
            );

            return result.FirstOrDefault();
        }

        private static PrintTemplateVersion MapPrintTemplateVersion(NpgsqlDataReader reader)
        {
            PrintTemplateVersion printTemplateVersion = new PrintTemplateVersion(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetFieldValue<Guid>("TemplateId"),
                reader.GetInt32("VersionNumber"),
                Enum.Parse<PrintPaperSize>(reader.GetString("PaperSize")),
                Enum.Parse<PrintOrientation>(reader.GetString("Orientation")),
                reader.GetString("HeaderHtml"),
                reader.GetString("BodyHtml"),
                reader.GetString("FooterHtml"),
                reader.GetString("CustomCss")
            );

            return printTemplateVersion;
        }
    }
}
