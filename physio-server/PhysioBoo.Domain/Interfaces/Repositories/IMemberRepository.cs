using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IMemberRepository : IRepository<MemberPoint>
    {
        // Loads Patient -> Profile. Use for update, get-by-id and balance changes (gotcha 4).
        Task<MemberPoint?> GetWithLinksAsync(Guid id, CancellationToken ct = default);

        // Atomically changes the balance and appends the ledger row in one transaction.
        // Returns the new balance. On failure, Error holds an error code
        // (ObjectNotFound, Member.NotActive, PointTransaction.InsufficientPoints, CommitFailed).
        Task<DbResult<int>> ApplyPointsAsync(
            Guid memberId,
            PointTransactionType type,
            int points,
            string code,
            string description,
            Guid? rewardId,
            Guid tenantId,
            Guid userId,
            CancellationToken ct = default
        );
    }
}
