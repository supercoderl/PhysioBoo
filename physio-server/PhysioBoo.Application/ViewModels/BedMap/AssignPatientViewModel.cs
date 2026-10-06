namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed record AssignPatientViewModel(
        Guid PatientId,
        DateTime? ExpectedDischargeDate,
        string? Notes
    );
}
