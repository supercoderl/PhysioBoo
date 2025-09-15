using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class MedicineInventory : Entity
    {
        #region Core Medicine Inventory Table (22)
        public Guid MedicineId { get; private set; }
        public Guid HospitalId { get; private set; }
        public string? BatchNumber { get; private set; }
        public Guid SupplierId { get; private set; }
        public DateOnly? PurchaseDate { get; private set; }
        public DateOnly? ExpiryDate { get; private set; }
        public int QuantityReceived { get; private set; }
        public int QuantityAvailable { get; private set; }
        public int QuantitySold { get; private set; }
        public int QuantityExpired { get; private set; }
        public int QuantityDamaged { get; private set; }
        public decimal? UnitPurchasePrice { get; private set; }
        public decimal? UnitSellingPrice { get; private set; }
        public decimal? TotalPurchaseValue { get; private set; }
        public string? StorageLocation { get; private set; }
        public int MinimumStockLevel { get; private set; }
        public int MaximumStockLevel { get; private set; }
        public int ReorderLevel { get; private set; }
        public bool IsExpired { get; private set; }
        public bool IsNearExpiry { get; private set; }
        public DateTime? LastUpdated { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("MedicineId")]
        [InverseProperty("MedicineInventories")]
        public virtual Medicine? Medicine { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("MedicineInventories")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("SupplierId")]
        [InverseProperty("MedicineInventories")]
        public virtual Supplier? Supplier { get; private set; }
        #endregion

        #region Constructor (22)
        public MedicineInventory(
            Guid id,
            Guid medicineId,
            Guid hospitalId,
            string? batchNumber,
            Guid supplierId,
            DateOnly? purchaseDate,
            DateOnly? expiryDate,
            decimal? unitPurchasePrice,
            decimal? unitSellingPrice,
            decimal? totalPurchaseValue,
            string? storageLocation,
            DateTime? lastUpdated
        ) : base(id)
        {
            MedicineId = medicineId;
            HospitalId = hospitalId;
            BatchNumber = batchNumber;
            SupplierId = supplierId;
            PurchaseDate = purchaseDate;
            ExpiryDate = expiryDate;
            QuantityReceived = 0;
            QuantityAvailable = 0;
            QuantitySold = 0;
            QuantityExpired = 0;
            QuantityDamaged = 0;
            UnitPurchasePrice = unitPurchasePrice;
            UnitSellingPrice = unitSellingPrice;
            TotalPurchaseValue = totalPurchaseValue;
            StorageLocation = storageLocation;
            MinimumStockLevel = 0;
            MaximumStockLevel = 0;
            ReorderLevel = 0;
            IsExpired = false;
            IsNearExpiry = false;
            LastUpdated = lastUpdated;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (22)
        public void SetMedicineId(Guid medicineId) { MedicineId = medicineId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetBatchNumber(string? batchNumber) { BatchNumber = batchNumber; }
        public void SetSupplierId(Guid supplierId) { SupplierId = supplierId; }
        public void SetPurchaseDate(DateOnly? purchaseDate) { PurchaseDate = purchaseDate; }
        public void SetExpiryDate(DateOnly? expiryDate) { ExpiryDate = expiryDate; }
        public void SetQuantityReceived(int quantityReceived) { QuantityReceived = quantityReceived; }
        public void SetQuantityAvailable(int quantityAvailable) { QuantityAvailable = quantityAvailable; }
        public void SetQuantitySold(int quantitySold) { QuantitySold = quantitySold; }
        public void SetQuantityExpired(int quantityExpired) { QuantityExpired = quantityExpired; }
        public void SetQuantityDamaged(int quantityDamaged) { QuantityDamaged = quantityDamaged; }
        public void SetUnitPurchasePrice(decimal? unitPurchasePrice) { UnitPurchasePrice = unitPurchasePrice; }
        public void SetUnitSellingPrice(decimal? unitSellingPrice) { UnitSellingPrice = unitSellingPrice; }
        public void SetTotalPurchaseValue(decimal? totalPurchaseValue) { TotalPurchaseValue = totalPurchaseValue; }
        public void SetStorageLocation(string? storageLocation) { StorageLocation = storageLocation; }
        public void SetMinimumStockLevel(int minimumStockLevel) { MinimumStockLevel = minimumStockLevel; }
        public void SetMaximumStockLevel(int maximumStockLevel) { MaximumStockLevel = maximumStockLevel; }
        public void SetReorderLevel(int reorderLevel) { ReorderLevel = reorderLevel; }
        public void SetIsExpired(bool isExpired) { IsExpired = isExpired; }
        public void SetIsNearExpiry(bool isNearExpiry) { IsNearExpiry = isNearExpiry; }
        public void SetLastUpdated(DateTime? lastUpdated) { LastUpdated = lastUpdated; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
