namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed class OperatingRoomViewModel
    {
        public Guid Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public Guid? CurrentSurgeryId { get; set; }
        public string? CurrentProcedure { get; set; }
        public string? SurgeonName { get; set; }
        public string? PatientName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EstimatedFinishTime { get; set; }
        public bool EquipmentReady { get; set; }
    }
}
