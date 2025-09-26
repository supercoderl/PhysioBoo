namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record CreatePrescriptionViewModel
    (
        Guid Id,
        string PrescriptionNumber,
        Guid PatientId,
        Guid DoctorId,
        Guid AppoinmentId,
        Guid MedicalRecordId,
        Guid HospitalId,
        string? Diagnosis,
        string? Instructions,
        decimal TotalAmount,
        DateOnly? ValidUntil,
        string? PharmacistNotes
    );
}
