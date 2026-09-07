

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ITransactionRepository : IRepository<Transaction>
    {
        Task<Transaction?> GetByMerchantReferenceAsync(string merchantReference, CancellationToken ct);
        Task<Transaction?> GetByInvoiceNoAsync(string invoiceNo, CancellationToken ct);
    }
}
