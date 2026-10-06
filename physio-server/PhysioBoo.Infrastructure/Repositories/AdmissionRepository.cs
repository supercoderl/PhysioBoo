using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class AdmissionRepository : BaseRepository<Admission>, IAdmissionRepository
    {
        public AdmissionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<Admission?> GetWithLinksAsync(Guid id, CancellationToken ct = default)
        {
            return await DbSet
                .Include(x => x.Patient)
                    .ThenInclude(p => p!.Profile)
                .Include(x => x.Department)
                .Include(x => x.Doctor)
                    .ThenInclude(d => d!.User)
                        .ThenInclude(u => u!.Profile)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }
    }
}
