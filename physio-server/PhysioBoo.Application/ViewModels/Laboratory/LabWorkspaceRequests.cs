namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record CollectLabSampleViewModel(string? CollectorName, string? ContainerType);

    public sealed record LabReasonViewModel(string? Reason);

    public sealed record UpdateLabResultViewModel(string? Value, string? Comments);
}

namespace PhysioBoo.Application.ViewModels.Laboratory
{
    /// <summary>A clinician ordering tests for a patient. Visit, doctor and hospital are taken from the patient's latest visit.</summary>
    public sealed record PlaceLabOrderViewModel(Guid PatientId, List<Guid>? TestIds, string? Priority, string? ClinicalNotes);
}
