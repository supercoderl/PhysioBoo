using PhysioBoo.Domain.Entities.MedicalStaff;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorSpecialtyRepository : BaseRepository<DoctorSpecialty>, IDoctorSpecialtyRepository
    {
        public DoctorSpecialtyRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
