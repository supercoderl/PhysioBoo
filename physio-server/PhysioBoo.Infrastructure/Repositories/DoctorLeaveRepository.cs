using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorLeaveRepository : BaseRepository<DoctorLeave>, IDoctorLeaveRepository
    {
        public DoctorLeaveRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
