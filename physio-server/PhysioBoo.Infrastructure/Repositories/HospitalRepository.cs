using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Operation;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class HospitalRepository : BaseRepository<Hospital>, IHospitalRepository
    {
        private readonly ApplicationDbContext _context;

        public HospitalRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<Dictionary<Guid, int>> CountByHospitalGroupAsync(IReadOnlyCollection<Guid> hospitalGroupIds, CancellationToken ct = default)
        {
            return _context.Hospitals
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(h => h.DeletedAt == null && hospitalGroupIds.Contains(h.TenantId))
                .GroupBy(h => h.TenantId)
                .Select(g => new { HospitalGroupId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.HospitalGroupId, x => x.Count, ct);
        }
    }
}
