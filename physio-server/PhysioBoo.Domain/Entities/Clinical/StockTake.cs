using PhysioBoo.Domain.Entities.Core;




namespace PhysioBoo.Domain.Entities.Clinical
{
    public class StockTake : TenantEntity
    {
        #region Core Stock Take Table (9)
        public string Code { get; private set; }
        // Backs the frontend's WarehouseId — one hospital = one warehouse, no dedicated Warehouse
        // entity exists (see docs/stock-take-redesign.md §17.0).
        public Guid HospitalId { get; private set; }
        public Guid DepartmentId { get; private set; }
        public Guid? AssignedTo { get; private set; }
        public DateOnly ScheduledDate { get; private set; }
        public StockTakeStatus Status { get; private set; }
        public string? Notes { get; private set; }
        public string? RejectionReason { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? AssignedToUser { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<StockTakeItem> StockTakeItems { get; private set; } = new List<StockTakeItem>();
        public virtual ICollection<StockTakeActivity> StockTakeActivities { get; private set; } = new List<StockTakeActivity>();
        #endregion

        #region Constructor (9)
        public StockTake(
            Guid id,
            string code,
            Guid hospitalId,
            Guid departmentId,
            Guid? assignedTo,
            DateOnly scheduledDate,
            string? notes
        ) : base(id)
        {
            Code = code;
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            AssignedTo = assignedTo;
            ScheduledDate = scheduledDate;
            Status = StockTakeStatus.Draft;
            Notes = notes;
        }
        #endregion

        #region Setter Methods (9)
        public void SetAssignedTo(Guid? assignedTo) { AssignedTo = assignedTo; }
        public void SetScheduledDate(DateOnly scheduledDate) { ScheduledDate = scheduledDate; }
        public void SetNotes(string? notes) { Notes = notes; }

        public void Start()
        {
            Status = StockTakeStatus.Counting;
        }

        public void SubmitForApproval()
        {
            Status = StockTakeStatus.PendingApproval;
        }

        public void Approve()
        {
            Status = StockTakeStatus.Approved;
        }

        public void Reject(string reason)
        {
            Status = StockTakeStatus.Rejected;
            RejectionReason = reason;
        }

        public void Cancel()
        {
            Status = StockTakeStatus.Cancelled;
        }
        #endregion
    }
}
