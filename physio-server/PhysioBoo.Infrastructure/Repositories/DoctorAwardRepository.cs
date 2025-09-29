using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorAwardRepository : BaseRepository<DoctorAward>, IDoctorAwardRepository
    {
        public DoctorAwardRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
