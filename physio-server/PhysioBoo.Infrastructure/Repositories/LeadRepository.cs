using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LeadRepository : BaseRepository<Lead>, ILeadRepository
    {
        public LeadRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
