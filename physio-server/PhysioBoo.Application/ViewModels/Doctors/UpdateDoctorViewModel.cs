using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Doctors
{
    public sealed record UpdateDoctorViewModel
    (
        Guid Id,
        // Professional Profile
        string? Bio,
        string? About,
        string? Archivements,
        string? ResearchInterests,
        string[] LanguagesSpoken,
        int PublicationsCount,
        int ConferencePresentations,
        int YearsOfExperience,
        int YearsOfPractice,

        // Clinical Operations (Crucial for the Booking Engine)
        decimal ConsultationFeeMin,
        decimal ConsultationFeeMax,
        decimal FollowUpFee,
        decimal EmergencyConsultationFee,
        decimal HomeVisitFee,
        decimal VideoConsultationFee,
        int ConsultationDuration,
        int BufferTime,
        int AdvanceBookingDays,
        string? CancellationPolicy,

        // Availability Toggles
        bool IsAvailableOnline,
        bool IsAvailableHomeVisit,
        bool IsAvailableEmergency,

        // Financial/Legal (Often updated if the doctor changes banks/tax status)
        string? BankAccountDetails,
        string? PanNumber,
        string? Gstin,

        // Administrative (Usually restricted to HR/Admin roles)
        EmploymentStatus? EmploymentStatus
    );
}
