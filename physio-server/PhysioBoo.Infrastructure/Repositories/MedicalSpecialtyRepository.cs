using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MedicalSpecialtyRepository : BaseRepository<MedicalSpecialty>, IMedicalSpecialtyRepository
    {
        public MedicalSpecialtyRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
