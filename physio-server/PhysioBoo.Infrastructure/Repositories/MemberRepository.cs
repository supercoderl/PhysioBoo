using Microsoft.EntityFrameworkCore.Storage;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MemberRepository : BaseRepository<MemberPoint>, IMemberRepository
    {
        private readonly ApplicationDbContext _context;

        public MemberRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<MemberPoint?> GetWithLinksAsync(Guid id, CancellationToken ct = default)
        {
            return await DbSet
                .Include(x => x.Patient)
                    .ThenInclude(p => p!.Profile)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<DbResult<int>> ApplyPointsAsync(
            Guid memberId,
            PointTransactionType type,
            int points,
            string code,
            string description,
            Guid? rewardId,
            Guid tenantId,
            Guid userId,
            CancellationToken ct = default)
        {
            DbResult<int>? result = null;
            int delta = type == PointTransactionType.Earned ? points : -points;

            // The context uses a retrying execution strategy, so a manual transaction must run inside it.
            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    // A retry re-runs this delegate: drop anything tracked by a failed attempt.
                    _context.ChangeTracker.Clear();

                    await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                    // One atomic statement. For a redemption, the WHERE clause is the balance check,
                    // so two concurrent redemptions can never overdraw the member.
                    IQueryable<MemberPoint> target = DbSet.Where(m => m.Id == memberId && m.Status == MemberStatus.Active);
                    if (type == PointTransactionType.Redeemed)
                    {
                        target = target.Where(m => m.Points >= points);
                    }

                    int updated = await target.ExecuteUpdateAsync(
                        s => s.SetProperty(m => m.Points, m => m.Points + delta), ct);

                    if (updated == 0)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<int>.Fail(await ExplainRejectionAsync(memberId, ct));
                        return;
                    }

                    // The UPDATE holds the row lock until commit, so this read is the exact new balance.
                    var snapshot = await DbSet
                        .Where(m => m.Id == memberId)
                        .Select(m => new { m.Points, m.PatientId })
                        .FirstAsync(ct);

                    PointTransaction entry = new PointTransaction(
                        Guid.NewGuid(),
                        code,
                        memberId,
                        type,
                        points,
                        snapshot.Points,
                        description,
                        rewardId
                    );
                    entry.SetTenantId(tenantId);
                    entry.SetCreatedBy(userId);
                    _context.PointTransactions.Add(entry);

                    // Keep the patient's mirror of the balance in sync (the retail POS reads it).
                    await _context.Set<Patient>()
                        .Where(p => p.Id == snapshot.PatientId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.LoyaltyPoints, snapshot.Points), ct);

                    await _context.SaveChangesAsync(ct);
                    await transaction.CommitAsync(ct);

                    result = DbResult<int>.Ok(snapshot.Points);
                });
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<int>.Fail(ErrorCodes.CommitFailed);
            }

            return result ?? DbResult<int>.Fail(ErrorCodes.CommitFailed);
        }

        private async Task<string> ExplainRejectionAsync(Guid memberId, CancellationToken ct)
        {
            MemberPoint? member = await DbSet.FirstOrDefaultAsync(m => m.Id == memberId, ct);

            if (member == null) return ErrorCodes.ObjectNotFound;
            if (member.Status != MemberStatus.Active) return DomainErrorCodes.Member.NotActive;
            return DomainErrorCodes.PointTransaction.InsufficientPoints;
        }
    }
}
