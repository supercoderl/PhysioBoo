using PhysioBoo.Domain.Entities.MedicalStaff;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorPublicationRepository : BaseRepository<DoctorPublication>, IDoctorPublicationRepository
    {
        public DoctorPublicationRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
