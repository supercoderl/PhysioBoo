using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorScheduleSpecialtyRepository : BaseRepository<DoctorSpecialty>, IDoctorSpecialtyRepository
    {
        public DoctorScheduleSpecialtyRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
