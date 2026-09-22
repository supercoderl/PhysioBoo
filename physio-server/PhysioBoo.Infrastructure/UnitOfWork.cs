
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Interfaces;

namespace PhysioBoo.Infrastructure
{
    public sealed class UnitOfWork<TContext> : IUnitOfWork where TContext : DbContext
    {
        private readonly TContext _context;
        private readonly ILogger<UnitOfWork<TContext>> _logger;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(TContext context, ILogger<UnitOfWork<TContext>> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task BeginTransactionAsync(CancellationToken ct = default)
        {
            _transaction = await _context.Database.BeginTransactionAsync(ct);
        }

        public async Task<bool> CommitAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException dbUpdateException)
            {
                _logger.LogError(dbUpdateException, "An error occured during commiting changes");
                throw;
            }
        }

        public async Task CommitTransactionAsync(CancellationToken ct = default)
        {
            if (_transaction == null) return;

            try
            {
                await _context.SaveChangesAsync(ct);
                await _transaction.CommitAsync(ct);
            }
            finally
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            // ReSharper disable once GCSuppressFinalizeForTypeWithoutDestructor
            GC.SuppressFinalize(this);
        }

        public async Task RollbackTransactionAsync(CancellationToken ct = default)
        {
            if (_transaction == null) return;

            try
            {
                await _transaction.RollbackAsync(ct);
            }
            finally
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        private void Dispose(bool disposing)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }
    }
}
