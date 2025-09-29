using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.LabOrders
{
    public sealed record CreateLabOrderViewModel
    (
        Guid Id,
        string OrderNumber,
        Guid PatientId,
        Guid DoctorId,
        Guid AppointmentId,
        Guid HospitalId,
        string? ClinicalHistory,
        string? PrivisionalDiagnosis,
        CollectionType CollectionType,
        DateOnly? CollectionDate,
        TimeOnly? CollectionTime,
        string? CollectionAddress,
        string? SpecialInstructions
    );
}
