namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record CdsCheckViewModel
    (
        Guid PatientId,
        List<CdsCheckItemInput> Items,
        Guid? ExcludePrescriptionId
    );
}
