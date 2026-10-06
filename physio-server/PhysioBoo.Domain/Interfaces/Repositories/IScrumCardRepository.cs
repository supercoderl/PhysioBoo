using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IScrumCardRepository : IRepository<ScrumCard>
    {
        // Moves a card to targetIndex (0-based, clamped) of the target column and renumbers the positions of
        // the source and target columns, all in one transaction. On failure, Error holds ObjectNotFound,
        // ScrumboardWrongBoard or CommitFailed.
        Task<DbResult<Guid>> MoveAsync(
            Guid cardId,
            Guid targetListId,
            int targetIndex,
            Guid userId,
            CancellationToken ct = default
        );
    }
}
