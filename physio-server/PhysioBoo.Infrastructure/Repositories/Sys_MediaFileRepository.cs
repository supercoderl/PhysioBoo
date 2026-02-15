using Npgsql;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_MediaFileRepository : BaseRepository<Sys_MediaFile>, ISys_MediaFileRepository
    {
        public Sys_MediaFileRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<Sys_MediaFile?> GetByUrlAsync(string url)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_url"] = url
            };

            List<Sys_MediaFile> result = await ExecutePostgresFunctionAsync<Sys_MediaFile>(
                "get_media_file_by_url",
                parameters,
                reader => MapSys_MediaFile(reader)
            );

            return result.FirstOrDefault();
        }

        private static Sys_MediaFile MapSys_MediaFile(NpgsqlDataReader reader)
        {
            Sys_MediaFile mediaFile = new Sys_MediaFile(
                reader.GetFieldValue<Guid>("Id"),
                reader.GetString("PublicId"),
                reader.GetString("Url"),
                reader.GetString("RefType"),
                reader.IsDBNull("RefId") ? null : reader.GetGuid("RefId")
            );

            return mediaFile;
        }
    }
}
