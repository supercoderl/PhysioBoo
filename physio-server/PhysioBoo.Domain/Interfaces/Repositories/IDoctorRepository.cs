using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IDoctorRepository : IRepository<Doctor>
    {
        Task<DbResult<Guid>> RegisterDoctor(User user, Profile profile, Doctor doctor, CancellationToken cancellationToken);
    }
}
