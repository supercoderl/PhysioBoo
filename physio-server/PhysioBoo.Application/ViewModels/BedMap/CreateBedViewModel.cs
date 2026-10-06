namespace PhysioBoo.Application.ViewModels.BedMap
{
    // Floor defaults to the ward's floor when omitted.
    public sealed record CreateBedViewModel(
        Guid WardId,
        string Number,
        string? RoomNumber,
        int? Floor,
        string BedType,
        bool IsolationRequired,
        string? Notes
    );
}
