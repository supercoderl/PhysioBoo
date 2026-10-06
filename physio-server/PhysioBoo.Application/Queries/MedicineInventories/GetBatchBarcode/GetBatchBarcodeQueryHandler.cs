using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Services;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetBatchBarcode
{
    public sealed class GetBatchBarcodeQueryHandler : IRequestHandler<GetBatchBarcodeQuery, string?>
    {
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IMediatorHandler _bus;

        public GetBatchBarcodeQueryHandler(IMedicineInventoryRepository inventoryRepository, IMediatorHandler bus)
        {
            _inventoryRepository = inventoryRepository;
            _bus = bus;
        }

        public async Task<string?> Handle(GetBatchBarcodeQuery request, CancellationToken ct)
        {
            var batch = await _inventoryRepository
                .GetAllNoTracking(b => b.Id == request.BatchId)
                .Select(b => new { b.Id, b.BatchNumber })
                .FirstOrDefaultAsync(ct);

            if (batch == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetBatchBarcodeQuery),
                    $"Batch with id {request.BatchId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            // Batches without a number get a label of their id so they can still be scanned.
            return Code128SvgRenderer.RenderDataUrl(string.IsNullOrWhiteSpace(batch.BatchNumber) ? batch.Id.ToString("N")[..12] : batch.BatchNumber);
        }
    }
}
