
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;


namespace PhysioBoo.Infrastructure.BackgroundJobs
{
    // Evaluates MedicineInventory thresholds every 15 minutes and raises InventoryAlert rows.
    // Covers LowStock/OutOfStock/NearExpiry/ExpiredBatch/Overstock — all directly computable from
    // existing MedicineInventory fields. Discrepancy (needs StockTake variance data),
    // TemperatureExcursion (needs sensor data — no such source exists), and ControlledDrug (needs a
    // dedicated compliance rule set) are deliberately NOT implemented yet — flagged here rather than
    // silently only covering part of InventoryAlertType.
    public sealed class InventoryAlertJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InventoryAlertJob> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(15);

        public InventoryAlertJob(
            IServiceProvider serviceProvider,
            ILogger<InventoryAlertJob> logger
        )
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Inventory Alert Job started");

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await EvaluateAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error evaluating inventory alerts");
                }

                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("Inventory Alert Job stopped");
        }

        private async Task EvaluateAsync(CancellationToken ct)
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            IMedicineInventoryRepository medicineInventoryRepository = scope.ServiceProvider.GetRequiredService<IMedicineInventoryRepository>();
            IInventoryAlertRepository inventoryAlertRepository = scope.ServiceProvider.GetRequiredService<IInventoryAlertRepository>();

            List<MedicineInventory> batches = await medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            // Existing unacknowledged alerts, so this pass doesn't spam a duplicate every 15 minutes.
            List<InventoryAlert> existingUnacknowledged = await inventoryAlertRepository
                .GetAllNoTracking(filter: a => a.AcknowledgedAt == null)
                .ToListAsync(ct);

            int raised = 0;

            foreach (MedicineInventory batch in batches)
            {
                raised += await RaiseIfMissing(inventoryAlertRepository, existingUnacknowledged, batch,
                    condition: batch.QuantityAvailable <= 0,
                    type: InventoryAlertType.OutOfStock,
                    severity: InventoryAlertSeverity.Critical,
                    message: $"Batch {batch.BatchNumber} is out of stock.",
                    recommendation: "Reorder or transfer stock from another zone.",
                    ct);

                raised += await RaiseIfMissing(inventoryAlertRepository, existingUnacknowledged, batch,
                    condition: batch.QuantityAvailable > 0 && batch.QuantityAvailable <= batch.ReorderLevel,
                    type: InventoryAlertType.LowStock,
                    severity: InventoryAlertSeverity.High,
                    message: $"Batch {batch.BatchNumber} is at or below its reorder level ({batch.QuantityAvailable}/{batch.ReorderLevel}).",
                    recommendation: "Place a reorder soon.",
                    ct);

                raised += await RaiseIfMissing(inventoryAlertRepository, existingUnacknowledged, batch,
                    condition: batch.IsExpired,
                    type: InventoryAlertType.ExpiredBatch,
                    severity: InventoryAlertSeverity.Critical,
                    message: $"Batch {batch.BatchNumber} has expired.",
                    recommendation: "Dispose of this batch and remove it from the sellable pool.",
                    ct);

                raised += await RaiseIfMissing(inventoryAlertRepository, existingUnacknowledged, batch,
                    condition: !batch.IsExpired && batch.IsNearExpiry,
                    type: InventoryAlertType.NearExpiry,
                    severity: InventoryAlertSeverity.Warning,
                    message: $"Batch {batch.BatchNumber} is nearing expiry ({batch.ExpiryDate}).",
                    recommendation: "Prioritize this batch for dispensing/sale (FEFO).",
                    ct);

                raised += await RaiseIfMissing(inventoryAlertRepository, existingUnacknowledged, batch,
                    condition: batch.MaximumStockLevel > 0 && batch.QuantityAvailable > batch.MaximumStockLevel,
                    type: InventoryAlertType.Overstock,
                    severity: InventoryAlertSeverity.Info,
                    message: $"Batch {batch.BatchNumber} exceeds its maximum stock level ({batch.QuantityAvailable}/{batch.MaximumStockLevel}).",
                    recommendation: "Consider transferring excess stock to another zone.",
                    ct);
            }

            if (raised > 0)
            {
                _logger.LogInformation("Inventory Alert Job raised {Count} new alert(s)", raised);
            }
        }

        private static async Task<int> RaiseIfMissing(
            IInventoryAlertRepository inventoryAlertRepository,
            List<InventoryAlert> existingUnacknowledged,
            MedicineInventory batch,
            bool condition,
            InventoryAlertType type,
            InventoryAlertSeverity severity,
            string message,
            string recommendation,
            CancellationToken ct)
        {
            if (!condition) return 0;

            bool alreadyRaised = existingUnacknowledged.Any(a => a.Type == type && a.MedicineId == batch.MedicineId);
            if (alreadyRaised) return 0;

            InventoryAlert alert = new InventoryAlert(Guid.NewGuid(), type, severity, batch.MedicineId, message, recommendation);
            alert.SetTenantId(batch.TenantId);
            await inventoryAlertRepository.InsertAsync(alert);

            return 1;
        }
    }
}
