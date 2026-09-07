using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MedicineCategoryRepository : BaseRepository<MedicineCategory>, IMedicineCategoryRepository
    {
        public MedicineCategoryRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
