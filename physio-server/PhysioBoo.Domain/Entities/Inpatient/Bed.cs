namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class Bed : TenantEntity
    {
        #region Core Bed Table (9)
        public Guid WardId { get; private set; }
        public string Number { get; private set; }
        public string? RoomNumber { get; private set; }
        public int Floor { get; private set; }
        public BedType BedType { get; private set; }
        public BedStatus Status { get; private set; }
        public bool IsolationRequired { get; private set; }
        public string? Notes { get; private set; }

        // The open stay, kept on the bed so a map of hundreds of beds needs no filtered include.
        public Guid? CurrentAssignmentId { get; private set; }

        public virtual Ward? Ward { get; private set; }
        public virtual BedAssignment? CurrentAssignment { get; private set; }
        public virtual ICollection<BedAssignment> Assignments { get; private set; } = new List<BedAssignment>();
        #endregion

        #region Constructor (9)
        public Bed(
            Guid id,
            Guid wardId,
            string number,
            string? roomNumber,
            int floor,
            BedType bedType,
            bool isolationRequired,
            string? notes
        ) : base(id)
        {
            WardId = wardId;
            Number = number;
            RoomNumber = roomNumber;
            Floor = floor;
            BedType = bedType;
            Status = BedStatus.Available;
            IsolationRequired = isolationRequired;
            Notes = notes;
            CurrentAssignmentId = null;
        }
        #endregion

        #region Setter Methods (9)
        public void SetWardId(Guid wardId) { WardId = wardId; }
        public void SetNumber(string number) { Number = number; }
        public void SetRoomNumber(string? roomNumber) { RoomNumber = roomNumber; }
        public void SetFloor(int floor) { Floor = floor; }
        public void SetBedType(BedType bedType) { BedType = bedType; }
        public void SetStatus(BedStatus status) { Status = status; }
        public void SetIsolationRequired(bool isolationRequired) { IsolationRequired = isolationRequired; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetCurrentAssignmentId(Guid? currentAssignmentId) { CurrentAssignmentId = currentAssignmentId; }
        #endregion
    }
}
