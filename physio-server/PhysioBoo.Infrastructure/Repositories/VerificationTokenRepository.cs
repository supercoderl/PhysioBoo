using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class VerificationTokenRepository : BaseRepository<VerificationToken>, IVerificationTokenRepository
    {
        public VerificationTokenRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
