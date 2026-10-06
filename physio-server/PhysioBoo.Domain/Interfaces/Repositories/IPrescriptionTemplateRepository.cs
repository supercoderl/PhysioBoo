using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IPrescriptionTemplateRepository : IRepository<PrescriptionTemplate>
    {
        /// <summary>
        /// Tracks a new entity (and any children) so it is saved with the unit of work.
        /// </summary>
        void Add(PrescriptionTemplate entity);
    }
}
