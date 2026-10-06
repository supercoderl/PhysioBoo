using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IDispenseSessionRepository : IRepository<DispenseSession>
    {
        /// <summary>
        /// Tracks a new session (and its items) so it is saved with the unit of work.
        /// </summary>
        void Add(DispenseSession session);
    }
}
