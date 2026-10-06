using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class TreatmentOrderRepository : BaseRepository<TreatmentOrder>, ITreatmentOrderRepository
    {
        public TreatmentOrderRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
