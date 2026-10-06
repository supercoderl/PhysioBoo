namespace PhysioBoo.Domain.Entities.Theatre
{
    public class OperatingRoom : TenantEntity
    {
        #region Core OperatingRoom Table (4)
        public string RoomNumber { get; private set; }
        public string RoomType { get; private set; }
        public OperatingRoomStatus Status { get; private set; }
        public bool EquipmentReady { get; private set; }
        #endregion

        #region Constructor (4)
        public OperatingRoom(
            Guid id,
            string roomNumber,
            string roomType
        ) : base(id)
        {
            RoomNumber = roomNumber;
            RoomType = roomType;
            Status = OperatingRoomStatus.Available;
            EquipmentReady = true;
        }
        #endregion

        #region Setter Methods (4)
        public void SetRoomNumber(string roomNumber) { RoomNumber = roomNumber; }
        public void SetRoomType(string roomType) { RoomType = roomType; }
        public void SetStatus(OperatingRoomStatus status) { Status = status; }
        public void SetEquipmentReady(bool equipmentReady) { EquipmentReady = equipmentReady; }
        #endregion
    }
}
