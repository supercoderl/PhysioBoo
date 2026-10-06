using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class TreatmentProcedureRepository : BaseRepository<TreatmentProcedure>, ITreatmentProcedureRepository
    {
        public TreatmentProcedureRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
