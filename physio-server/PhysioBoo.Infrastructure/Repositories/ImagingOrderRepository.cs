using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ImagingOrderRepository : BaseRepository<ImagingOrder>, IImagingOrderRepository
    {
        public ImagingOrderRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
