using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class FavoriteMedicationRepository : BaseRepository<FavoriteMedication>, IFavoriteMedicationRepository
    {
        public FavoriteMedicationRepository(ApplicationDbContext context) : base(context)
        {

        }

        public void Add(FavoriteMedication entity)
        {
            DbSet.Add(entity);
        }
    }
}
