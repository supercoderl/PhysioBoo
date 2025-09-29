using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorEducationRepository : BaseRepository<DoctorEducation>, IDoctorEducationRepository
    {
        public DoctorEducationRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
