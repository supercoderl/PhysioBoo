namespace PhysioBoo.Application.ViewModels.Appointments
{
    public sealed record CreateAppointmentViewModel
    (
        Guid Id,
        Guid PatientId,
        Guid DoctorId,
        Guid HospitalId,
        Guid DepartmentId,
        Guid AppointmentTypeId,
        DateOnly ScheduledDate,
        TimeOnly ScheduledTime,
        TimeOnly? ScheduledEndTime,
        TimeOnly? ActualStartTime,
        TimeOnly? ActualEndTime,
        int DurationMinutes,
        string? ChiefComplaint,
        string? Symptoms,
        string? ReasonForVisit,
        string? ReferralReason,
        Guid? ReferringDoctorId,
        string? PreAppointmentNotes,
        string? PostAppointmentNotes,
        string? Diagnosis,
        string? TreatmentPlan,
        string? PrescriptionsGiven,
        string? InvestigationsOrdered,
        DateOnly? FollowUpDate,
        string? FollowUpInstructions,
        string? PaymentMethod,
        string? RoomNumber,
        int QueueNumber,
        int EstimatedWaitTime,
        int PatientSatisfactionRating
    );
}
