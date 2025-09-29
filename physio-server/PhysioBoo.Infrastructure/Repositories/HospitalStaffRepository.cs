using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HospitalStaffRepository : BaseRepository<HospitalStaff>, IHospitalStaffRepository
    {
        public HospitalStaffRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
