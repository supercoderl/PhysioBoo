using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PatientAllergyRepository : BaseRepository<PatientAllergy>, IPatientAllergyRepository
    {
        public PatientAllergyRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
