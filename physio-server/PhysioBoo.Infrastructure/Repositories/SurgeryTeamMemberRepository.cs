using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryTeamMemberRepository : BaseRepository<SurgeryTeamMember>, ISurgeryTeamMemberRepository
    {
        public SurgeryTeamMemberRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
