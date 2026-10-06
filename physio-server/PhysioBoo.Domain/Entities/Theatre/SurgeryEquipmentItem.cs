namespace PhysioBoo.Domain.Entities.Theatre
{
    public class SurgeryEquipmentItem : TenantEntity
    {
        #region Core SurgeryEquipmentItem Table (5)
        public Guid SurgeryCaseId { get; private set; }
        public string Name { get; private set; }
        public EquipmentCategory Category { get; private set; }
        public EquipmentStatus Status { get; private set; }
        public int Quantity { get; private set; }

        public virtual SurgeryCase? SurgeryCase { get; private set; }
        #endregion

        #region Constructor (5)
        public SurgeryEquipmentItem(
            Guid id,
            Guid surgeryCaseId,
            string name,
            EquipmentCategory category,
            int quantity
        ) : base(id)
        {
            SurgeryCaseId = surgeryCaseId;
            Name = name;
            Category = category;
            Status = EquipmentStatus.Reserved;
            Quantity = quantity;
        }
        #endregion

        #region Setter Methods (5)
        public void SetName(string name) { Name = name; }
        public void SetCategory(EquipmentCategory category) { Category = category; }
        public void SetStatus(EquipmentStatus status) { Status = status; }
        public void SetQuantity(int quantity) { Quantity = quantity; }
        #endregion
    }
}
