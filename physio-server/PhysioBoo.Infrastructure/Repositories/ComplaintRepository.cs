using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ComplaintRepository : BaseRepository<Complaint>, IComplaintRepository
    {
        public ComplaintRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
