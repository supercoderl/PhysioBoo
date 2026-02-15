using Npgsql;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_LanguageRepository : BaseRepository<Sys_Language>, ISys_LanguageRepository
    {
        public Sys_LanguageRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<Sys_Language?> GetByCodeAsync(string code)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_code"] = code
            };

            List<Sys_Language> result = await ExecutePostgresFunctionAsync<Sys_Language>(
                "get_language_by_code",
                parameters,
                reader => MapLanguage(reader)
            );

            return result.FirstOrDefault();
        }

        private static Sys_Language MapLanguage(NpgsqlDataReader reader)
        {
            Sys_Language language = new Sys_Language(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("Code"),
                reader.GetString("Name"),
                reader.IsDBNull("FlagUrl") ? null : reader.GetString("FlagUrl"),
                reader.GetBoolean("IsDefault"),
                reader.IsDBNull("NativeName") ? null : reader.GetString("NativeName"),
                reader.GetInt32("Index")
            );

            return language;
        }
    }
}
