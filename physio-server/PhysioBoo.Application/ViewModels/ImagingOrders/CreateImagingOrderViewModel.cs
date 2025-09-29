using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.ImagingOrders
{
    public sealed record CreateImagingOrderViewModel
    (
        Guid Id,
        Guid PatientId,
        Guid DoctorId,
        Guid AppointmentId,
        Guid HospitalId,
        Guid ModalityId,
        string? BodyPart,
        string? ClinicalIndication,
        string? ClinicalHistory,
        string? ProvisionalDiagnosis,
        string? SpecificQuestions,
        string? ContrastType,
        DateOnly? ScheduledDate,
        TimeOnly? ScheduledTime,
        int EstimatedDuration,
        decimal PatientWeight,
        decimal PatientHeight,
        string? AllergiesNoted,
        PregnancyStatus PregnancyStatus,
        bool ImplantsPresent,
        string? ImplantDetails,
        Guid? TechnicianId,
        Guid? RadiologistId
    );
}
