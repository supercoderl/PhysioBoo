using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class DoctorRepository : BaseRepository<Doctor>, IDoctorRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<DbResult<Guid>> RegisterDoctor(User user, Profile profile, Doctor doctor, CancellationToken ct)
        {
            DbResult<Guid>? result = null;

            Microsoft.EntityFrameworkCore.Storage.IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                try
                {
                    user.CreateDoctor(profile, doctor);
                    _context.Users.Add(user);

                    await _context.SaveChangesAsync(ct);
                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(doctor.Id);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(ct);
                    result = DbResult<Guid>.Fail("Failed to create the doctor.");
                }
            });

            return result ?? DbResult<Guid>.Fail("An error occured when returning result.");
        }
    }
}
