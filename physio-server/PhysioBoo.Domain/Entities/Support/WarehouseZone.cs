using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;



namespace PhysioBoo.Domain.Entities.Support
{
    public class WarehouseZone : TenantEntity
    {
        #region Core Warehouse Zone Table (3)
        public Guid HospitalId { get; private set; }
        public string Name { get; private set; }
        public WarehouseZoneType Type { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<MedicineInventory> MedicineInventories { get; private set; } = new List<MedicineInventory>();
        #endregion

        #region Constructor (3)
        public WarehouseZone(
            Guid id,
            Guid hospitalId,
            string name,
            WarehouseZoneType type
        ) : base(id)
        {
            HospitalId = hospitalId;
            Name = name;
            Type = type;
        }
        #endregion

        #region Setter Methods (3)
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetName(string name) { Name = name; }
        public void SetType(WarehouseZoneType type) { Type = type; }
        #endregion
    }
}
