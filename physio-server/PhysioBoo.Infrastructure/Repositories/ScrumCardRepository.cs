using Microsoft.EntityFrameworkCore.Storage;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ScrumCardRepository : BaseRepository<ScrumCard>, IScrumCardRepository
    {
        private readonly ApplicationDbContext _context;

        public ScrumCardRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<DbResult<Guid>> MoveAsync(
            Guid cardId,
            Guid targetListId,
            int targetIndex,
            Guid userId,
            CancellationToken ct = default)
        {
            DbResult<Guid>? result = null;

            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    _context.ChangeTracker.Clear();

                    await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                    ScrumCard? card = await _context.ScrumCards.AsTracking().FirstOrDefaultAsync(c => c.Id == cardId, ct);
                    if (card == null)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<Guid>.Fail(ErrorCodes.ObjectNotFound);
                        return;
                    }

                    bool targetOnSameBoard = await _context.ScrumLists.AnyAsync(l => l.Id == targetListId && l.BoardId == card.BoardId, ct);
                    if (!targetOnSameBoard)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<Guid>.Fail(DomainErrorCodes.Scrumboard.WrongBoard);
                        return;
                    }

                    Guid sourceListId = card.ListId;

                    List<ScrumCard> target = await _context.ScrumCards.AsTracking()
                        .Where(c => c.ListId == targetListId && c.Id != cardId)
                        .OrderBy(c => c.Position)
                        .ToListAsync(ct);

                    int index = Math.Clamp(targetIndex, 0, target.Count);
                    target.Insert(index, card);
                    card.SetListId(targetListId);

                    Renumber(target, userId);

                    if (sourceListId != targetListId)
                    {
                        List<ScrumCard> source = await _context.ScrumCards.AsTracking()
                            .Where(c => c.ListId == sourceListId && c.Id != cardId)
                            .OrderBy(c => c.Position)
                            .ToListAsync(ct);

                        Renumber(source, userId);
                    }

                    await _context.SaveChangesAsync(ct);
                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(cardId);
                });
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
            }

            _context.ChangeTracker.Clear();
            return result ?? DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
        }

        private static void Renumber(List<ScrumCard> cards, Guid userId)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            for (int i = 0; i < cards.Count; i++)
            {
                if (cards[i].Position == i) continue;

                cards[i].SetPosition(i);
                cards[i].SetUpdatedBy(userId);
                cards[i].SetUpdatedAt(now);
            }
        }
    }
}
