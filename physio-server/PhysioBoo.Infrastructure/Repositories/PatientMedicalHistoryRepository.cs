using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PatientMedicalHistoryRepository : BaseRepository<PatientMedicalHistory>, IPatientMedicalHistoryRepository
    {
        public PatientMedicalHistoryRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
