using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using System.Data;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class VerificationTokenRepository : BaseRepository<VerificationToken>, IVerificationTokenRepository
    {
        public VerificationTokenRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<Guid> GetUserIdByTokenAsync(string token)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                ["p_token"] = token
            };

            List<object> result = await ExecutePostgresFunctionAsync<object>(
                "get_userid_by_token",
                parameters,
                reader => (object)reader.GetFieldValue<Guid>("UserId")
            );

            object? firstItem = result.FirstOrDefault();
            if (firstItem == null) return Guid.Empty;
            return (Guid)firstItem;
        }
    }
}
