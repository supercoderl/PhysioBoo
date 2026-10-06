using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PrescriptionTemplateRepository : BaseRepository<PrescriptionTemplate>, IPrescriptionTemplateRepository
    {
        public PrescriptionTemplateRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(PrescriptionTemplate entity)
        {
            DbSet.Add(entity);
        }
    }
}
