using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ImagingModalityRepository : BaseRepository<ImagingModality>, IImagingModalityRepository
    {
        public ImagingModalityRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
