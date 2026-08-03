using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IPatientRepository : IRepository<Patient>
    {
        Task<DbResult<Guid>> InsertPatientFullInfo(Profile profile, Patient patient, CancellationToken ct);
    }
}
