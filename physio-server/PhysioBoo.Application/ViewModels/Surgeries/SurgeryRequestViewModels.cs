namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed record CreateSurgeryTeamMemberViewModel(Guid StaffId, string Role);

    public sealed record CreateSurgeryEquipmentViewModel(string Name, string Category, int Quantity);

    // Schedules a case. ConsentStatus defaults to NotObtained. The team and equipment are optional and
    // can be replaced later; a standard pre-operative checklist is added automatically.
    public sealed record CreateSurgeryViewModel(
        Guid PatientId,
        string Procedure,
        string SurgeryType,
        Guid? DepartmentId,
        Guid OperatingRoomId,
        DateTime ScheduledStart,
        int EstimatedDurationMinutes,
        string Priority,
        string Diagnosis,
        string? ConsentStatus,
        string? RiskAssessment,
        List<CreateSurgeryTeamMemberViewModel>? Team,
        List<CreateSurgeryEquipmentViewModel>? Equipment
    );

    public sealed record CancelSurgeryViewModel(string Reason);

    public sealed record CreateOperatingRoomViewModel(string RoomNumber, string RoomType);

    public sealed record UpdateRoomStatusViewModel(string Status);

    // The UI also sends signedBy; the server records the signed-in user instead.
    public sealed record UpdateChecklistItemViewModel(string Status, string? SignedBy);

    public sealed record AssignTeamMemberViewModel(Guid StaffId, string Role);

    public sealed record UpdateEquipmentItemViewModel(string Status, int? Quantity);

    public sealed record AdvanceStageViewModel(DateTime? OccurredAt);

    // Only the fields that are sent change; a field that is left out keeps its value.
    public sealed record UpdateIntraOpViewModel(
        string? Notes,
        string? Complications,
        int? BloodLossMl,
        int? EstimatedRemainingMinutes
    );

    public sealed record UpdatePostOpViewModel(
        string? PacuBay,
        string? RecoveryStatus,
        string? PostOpNotes,
        string? Complications,
        string? FollowUpOrders
    );

    public sealed record AcknowledgeSurgeryAlertViewModel(string? Note);
}
