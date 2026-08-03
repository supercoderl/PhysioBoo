using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class PatientRepository : BaseRepository<Patient>, IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<DbResult<Guid>> InsertPatientFullInfo(Profile profile, Patient patient, CancellationToken ct)
        {
            DbResult<Guid>? result = null;

            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                try
                {
                    patient.SetProfile(profile);
                    _context.Profiles.Add(profile);

                    await _context.SaveChangesAsync(ct);
                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(patient.Id);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(ct);
                    result = DbResult<Guid>.Fail("Failed to create the patient.");
                }
            });

            return result ?? DbResult<Guid>.Fail("An error occured when returning result.");
        }
    }
}
