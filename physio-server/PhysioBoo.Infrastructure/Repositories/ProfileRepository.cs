using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ProfileRepository : BaseRepository<Profile>, IProfileRepository
    {
        public ProfileRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
