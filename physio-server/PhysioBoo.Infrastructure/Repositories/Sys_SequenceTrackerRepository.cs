using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class Sys_SequenceTrackerRepository : BaseRepository<Sys_SequenceTracker>, ISys_SequenceTrackerRepository
    {
        private readonly ApplicationDbContext _context;

        public Sys_SequenceTrackerRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<string> GenerateNextCodeAsync(string entityType, CancellationToken cancellationToken = default)
        {
            Microsoft.EntityFrameworkCore.Storage.IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

                try
                {
                    Sys_SequenceTracker? rule = await DbSet.FirstOrDefaultAsync(ss => ss.EntityType == entityType, cancellationToken);

                    if (rule == null)
                        throw new Exception("No sequence rule found for the specified entity type.");

                    string datePart = string.Empty;
                    DateTime currentTime = TimeZoneHelper.GetLocalTimeNow();

                    if (!string.IsNullOrEmpty(rule.UseDateFormating))
                    {
                        datePart = currentTime.ToString(rule.UseDateFormating) + "-";
                    }

                    rule.GenerateNext(currentTime);

                    string sequencePart = rule.CurrentSequence.ToString().PadLeft(rule.SequenceLength, '0');
                    string finalCode = $"{rule.Prefix}{datePart}{sequencePart}{rule.Suffix}";

                    DbSet.Update(rule);
                    await _context.SaveChangesAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);

                    return finalCode;
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw;
                }
            });
        }
    }
}
