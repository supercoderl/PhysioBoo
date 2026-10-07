using PhysioBoo.Domain.Entities.LaboratoryImaging;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class LabOrderRepository : BaseRepository<LabOrder>, ILabOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public LabOrderRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task AddWithItemsAsync(LabOrder order, IEnumerable<LabOrderItem> items, CancellationToken ct)
        {
            _context.LabOrders.Add(order);
            _context.Set<LabOrderItem>().AddRange(items);
            await _context.SaveChangesAsync(ct);
        }
    }
}
