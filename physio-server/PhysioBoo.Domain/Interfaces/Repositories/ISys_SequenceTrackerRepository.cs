using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ISys_SequenceTrackerRepository : IRepository<Sys_SequenceTracker>
    {
        Task<string> GenerateNextCodeAsync(string entityType, CancellationToken cancellationToken = default);
    }
}
