
using PhysioBoo.Domain.Entities.Operation;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class TransactionRepository : BaseRepository<Transaction>, ITransactionRepository
    {
        public TransactionRepository(ApplicationDbContext context) : base(context)
        {

        }

        public Task<Transaction?> GetByMerchantReferenceAsync(string merchantReference, CancellationToken ct) =>
            DbSet.FirstOrDefaultAsync(t => t.MerchantReference == merchantReference, ct);

        public Task<Transaction?> GetByInvoiceNoAsync(string invoiceNo, CancellationToken ct) =>
            DbSet.FirstOrDefaultAsync(t => t.InvoiceNo == invoiceNo, ct);
    }
}
