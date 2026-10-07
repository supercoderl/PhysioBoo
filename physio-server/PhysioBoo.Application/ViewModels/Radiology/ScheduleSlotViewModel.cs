namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record ScheduleSlotViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string ExaminationName,
        string ModalityName,
        string RoomName,
        string? TechnicianName,
        DateTime ScheduledTime,
        int EstimatedDurationMinutes,
        string? PreparationInstructions,
        string Status
    );
}
