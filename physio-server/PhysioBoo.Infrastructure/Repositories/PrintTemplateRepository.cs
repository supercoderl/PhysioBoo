using Microsoft.EntityFrameworkCore;
using Npgsql;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrintTemplateRepository : BaseRepository<PrintTemplate>, IPrintTemplateRepository
    {
        private readonly ApplicationDbContext _context;

        public PrintTemplateRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PrintTemplate?> GetByCodeAsync(string code, CancellationToken cancellationToken)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_code"] = code
            };

            List<PrintTemplate> result = await ExecutePostgresFunctionAsync<PrintTemplate>(
                "get_print_template_by_code",
                parameters,
                reader => MapPrintTemplate(reader),
                cancellationToken
            );

            return result.FirstOrDefault();
        }

        public async Task<DbResult<Guid>> InsertTemplateWithVersion(PrintTemplate printTemplate, PrintTemplateVersion printTemplateVersion, CancellationToken cancellationToken)
        {
            DbResult<Guid>? result = null;

            Microsoft.EntityFrameworkCore.Storage.IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

                try
                {
                    _context.PrintTemplates.Add(printTemplate);
                    _context.PrintTemplateVersions.Add(printTemplateVersion);

                    await _context.SaveChangesAsync(cancellationToken);

                    printTemplate.SetCurrentVersionId(printTemplateVersion.Id);
                    await _context.SaveChangesAsync(cancellationToken);

                    await transaction.CommitAsync(cancellationToken);
                    result = DbResult<Guid>.Ok(printTemplate.Id);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    result = DbResult<Guid>.Fail("Failed to create template.");
                }
            });

            return result ?? DbResult<Guid>.Fail("An error occured when returning result.");
        }

        private static PrintTemplate MapPrintTemplate(NpgsqlDataReader reader)
        {
            PrintTemplate printTemplate = new PrintTemplate(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("Name"),
                reader.GetString("Code"),
                reader.GetString("Module"),
                reader.GetString("DocumentType"),
                reader.GetFieldValue<Guid?>("CurrentVersionId")
            );

            printTemplate.SetIsActive(reader.GetBoolean("IsActive"));
            printTemplate.SetIsDefault(reader.GetBoolean("IsSystemDefault"));

            return printTemplate;
        }
    }
}
