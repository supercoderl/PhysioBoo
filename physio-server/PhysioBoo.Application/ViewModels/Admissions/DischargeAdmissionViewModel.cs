namespace PhysioBoo.Application.ViewModels.Admissions
{
    public sealed record DischargeAdmissionViewModel(
        DateTime? DischargedAt,
        string? Notes
    );
}
