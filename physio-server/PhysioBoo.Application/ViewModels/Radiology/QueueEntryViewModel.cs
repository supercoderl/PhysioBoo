namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record QueueEntryViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string ExaminationName,
        string ModalityName,
        string Priority,
        string RoomName,
        string Status,
        DateTime? CalledAt
    );
}
