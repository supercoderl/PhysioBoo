using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Room : TenantEntity
    {
        #region Core Room Table (10)
        public Guid HospitalId { get; private set; }
        public Guid? DepartmentId { get; private set; }
        public string RoomNumber { get; private set; }
        public string? Name { get; private set; }
        public RoomType RoomType { get; private set; }
        public int? FloorNumber { get; private set; }
        public string? Wing { get; private set; }
        public int? Capacity { get; private set; }
        public bool IsActive { get; private set; }

        public virtual Hospital? Hospital { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Doctor> Doctors { get; private set; } = new List<Doctor>();
        #endregion

        #region Constructor (10)
        public Room(
            Guid id,
            Guid hospitalId,
            Guid? departmentId,
            string roomNumber,
            string? name,
            RoomType roomType,
            int? floorNumber,
            string? wing,
            int? capacity
        ) : base(id)
        {
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            RoomNumber = roomNumber;
            Name = name;
            RoomType = roomType;
            FloorNumber = floorNumber;
            Wing = wing;
            Capacity = capacity;
            IsActive = true; // Default to active
        }
        #endregion

        #region Setter Methods (10)
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetDepartmentId(Guid? departmentId) { DepartmentId = departmentId; }
        public void SetRoomNumber(string roomNumber) { RoomNumber = roomNumber; }
        public void SetName(string? name) { Name = name; }
        public void SetRoomType(RoomType roomType) { RoomType = roomType; }
        public void SetFloorNumber(int? floorNumber) { FloorNumber = floorNumber; }
        public void SetWing(string? wing) { Wing = wing; }
        public void SetCapacity(int? capacity) { Capacity = capacity; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
