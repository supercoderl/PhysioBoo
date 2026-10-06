namespace PhysioBoo.Application.ViewModels.BedMap
{
    // Status may be Available, Maintenance or Reserved. Occupied is only set by assigning a patient.
    public sealed record UpdateBedViewModel(
        Guid WardId,
        string Number,
        string? RoomNumber,
        int Floor,
        string BedType,
        string Status,
        bool IsolationRequired,
        string? Notes
    );
}
