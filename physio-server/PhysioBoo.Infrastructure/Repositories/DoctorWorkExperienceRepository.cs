using PhysioBoo.Domain.Entities.MedicalStaff;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorWorkExperienceRepository : BaseRepository<DoctorWorkExperience>, IDoctorWorkExperienceRepository
    {
        public DoctorWorkExperienceRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
