using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ILabOrderRepository : IRepository<LabOrder>
    {
        // Saves the order and its tests in one SaveChanges (InsertAsync would skip the items).
        Task AddWithItemsAsync(LabOrder order, IEnumerable<LabOrderItem> items, CancellationToken ct);
    }
}
