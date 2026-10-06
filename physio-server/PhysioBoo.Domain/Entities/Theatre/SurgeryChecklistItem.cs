namespace PhysioBoo.Domain.Entities.Theatre
{
    public class SurgeryChecklistItem : TenantEntity
    {
        #region Core SurgeryChecklistItem Table (6)
        public Guid SurgeryCaseId { get; private set; }
        public string Label { get; private set; }
        public int SortOrder { get; private set; }
        public ChecklistItemStatus Status { get; private set; }
        public string? SignedByName { get; private set; }
        public DateTime? SignedAt { get; private set; }

        public virtual SurgeryCase? SurgeryCase { get; private set; }
        #endregion

        #region Constructor (6)
        public SurgeryChecklistItem(
            Guid id,
            Guid surgeryCaseId,
            string label,
            int sortOrder
        ) : base(id)
        {
            SurgeryCaseId = surgeryCaseId;
            Label = label;
            SortOrder = sortOrder;
            Status = ChecklistItemStatus.Pending;
        }
        #endregion

        #region Setter Methods (6)
        public void SetLabel(string label) { Label = label; }
        public void SetStatus(ChecklistItemStatus status) { Status = status; }
        public void SetSignedByName(string? signedByName) { SignedByName = signedByName; }
        public void SetSignedAt(DateTime? signedAt) { SignedAt = signedAt; }
        #endregion
    }
}
