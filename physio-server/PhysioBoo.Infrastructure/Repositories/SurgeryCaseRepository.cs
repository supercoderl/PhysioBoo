using Microsoft.EntityFrameworkCore.Storage;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SurgeryCaseRepository : BaseRepository<SurgeryCase>, ISurgeryCaseRepository
    {
        private readonly ApplicationDbContext _context;

        public SurgeryCaseRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<SurgeryCase?> GetWithLinksAsync(Guid id, CancellationToken ct = default)
        {
            return await DbSet
                .Include(c => c.Patient)
                    .ThenInclude(p => p!.Profile)
                .Include(c => c.Department)
                .Include(c => c.OperatingRoom)
                .Include(c => c.Team)
                    .ThenInclude(t => t.StaffUser)
                        .ThenInclude(u => u!.Profile)
                .Include(c => c.Equipment)
                .Include(c => c.Checklist)
                .Include(c => c.Timeline)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c => c.Id == id, ct);
        }

        public async Task<DbResult<Guid>> CreateWithChildrenAsync(SurgeryCase surgeryCase, CancellationToken ct = default)
        {
            try
            {
                _context.ChangeTracker.Clear();
                DbSet.Add(surgeryCase);

                await _context.SaveChangesAsync(ct);
                _context.ChangeTracker.Clear();

                return DbResult<Guid>.Ok(surgeryCase.Id);
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
            }
        }

        public async Task<DbResult<Guid>> AdvanceStageAsync(
            Guid surgeryCaseId,
            SurgeryTimelineStage stage,
            DateTime occurredAt,
            SurgeryStatus newStatus,
            OperatingRoomStatus? roomStatus,
            Guid tenantId,
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

                    bool alreadyRecorded = await _context.SurgeryTimelineEvents
                        .AnyAsync(e => e.SurgeryCaseId == surgeryCaseId && e.Stage == stage, ct);
                    if (alreadyRecorded)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<Guid>.Fail(DomainErrorCodes.Surgery.StageOutOfOrder);
                        return;
                    }

                    Guid? updatedBy = userId;
                    DateTime? updatedAt = occurredAt;
                    int updated = await DbSet
                        .Where(c => c.Id == surgeryCaseId && c.Status != SurgeryStatus.Cancelled)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(c => c.Status, newStatus)
                            .SetProperty(c => c.UpdatedBy, updatedBy)
                            .SetProperty(c => c.UpdatedAt, updatedAt), ct);

                    if (updated == 0)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<Guid>.Fail(DomainErrorCodes.Surgery.NotEditable);
                        return;
                    }

                    SurgeryTimelineEvent timelineEvent = new SurgeryTimelineEvent(Guid.NewGuid(), surgeryCaseId, stage, occurredAt);
                    timelineEvent.SetTenantId(tenantId);
                    timelineEvent.SetCreatedBy(userId);
                    _context.SurgeryTimelineEvents.Add(timelineEvent);
                    await _context.SaveChangesAsync(ct);

                    if (roomStatus.HasValue)
                    {
                        OperatingRoomStatus targetRoomStatus = roomStatus.Value;
                        await _context.OperatingRooms
                            .Where(r => r.Id == DbSet.Where(c => c.Id == surgeryCaseId).Select(c => c.OperatingRoomId).First())
                            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Status, targetRoomStatus), ct);
                    }

                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(surgeryCaseId);
                });
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
            }

            return result ?? DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
        }
    }
}
