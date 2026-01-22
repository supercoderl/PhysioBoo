using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Doctors
{
    public sealed class DoctorViewModel
    {
        public Guid Id { get; set; }
        public string? Bio { get; set; }
        public string? About { get; set; }
        public string[] LanguagesSpoken { get; set; } = [];
        public bool IsAvailableOnline { get; set; }
        public bool IsAvailableHomeVisit { get; set; }
        public bool IsAvailableEmergency { get; set; }
        public bool IsFeature { get; set; }
        public bool IsVerified { get; set; }
        public Guid? PrimarySpecialtyId { get; set; }
        public string MedicalLicenseNumber { get; set; } = string.Empty;
        public DateOnly MedicalLicenseExpiry { get; set; }
        public string? MedicalLicenseIssuingAuthority { get; set; }
        public int YearsOfExperience { get; set; }
        public int YearsOfPractice { get; set; }
        public string? Archivements { get; set; }
        public string? ResearchInterests { get; set; }
        public int PublicationsCount { get; set; }
        public int ConferencePresentations { get; set; }
        public decimal ConsultationFeeMin { get; set; }
        public decimal ConsultationFeeMax { get; set; }
        public decimal FollowUpFee { get; set; }
        public decimal EmergencyConsultationFee { get; set; }
        public decimal HomeVisitFee { get; set; }
        public decimal VideoConsultationFee { get; set; }
        public int ConsultationDuration { get; set; }
        public int BufferTime { get; set; }
        public int AdvanceBookingDays { get; set; }
        public string? CancellationPolicy { get; set; }
        public string? EmployeeId { get; set; }
        public EmploymentStatus EmploymentStatus { get; set; }
        public DateTime? JoiningDate { get; set; }
        public DateTime? TerminationDate { get; set; }
        public string? BankAccountDetails { get; set; }
        public string[] PaymentMethods { get; set; } = [];
        public string? PanNumber { get; set; }
        public string? Gstin { get; set; }
        public int TotalPatientTreated { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal PatientSatisfactionScore { get; set; }
        public decimal AverageRating { get; set; } // out of 5
        public int TotalReviews { get; set; }
        public int TotalSurgeriesPerformed { get; set; }


        public static DoctorViewModel FromDoctor(Doctor doctor)
        {
            return new DoctorViewModel
            {
                Id = doctor.Id,
                Bio = doctor.Bio,
                About = doctor.About,
                LanguagesSpoken = doctor.LanguagesSpoken,
                IsAvailableOnline = doctor.IsAvailableOnline,
                IsAvailableHomeVisit = doctor.IsAvailableHomeVisit,
                IsAvailableEmergency = doctor.IsAvailableEmergency,
                IsFeature = doctor.IsFeatured,
                IsVerified = doctor.IsVerified,
                PrimarySpecialtyId = doctor.PrimarySpecialtyId,
                MedicalLicenseNumber = doctor.MedicalLicenseNumber,
                MedicalLicenseExpiry = doctor.MedicalLicenseExpiry,
                MedicalLicenseIssuingAuthority = doctor.MedicalLicenseIssuingAuthority,
                YearsOfExperience = doctor.YearsOfExperience,
                YearsOfPractice = doctor.YearsOfPractice,
                Archivements = doctor.Archivements,
                ResearchInterests = doctor.ResearchInterests,
                PublicationsCount = doctor.PublicationsCount,
                ConferencePresentations = doctor.ConferencePresentations,
                ConsultationFeeMin = doctor.ConsultationFeeMin,
                ConsultationFeeMax = doctor.ConsultationFeeMax,
                FollowUpFee = doctor.FollowUpFee,
                EmergencyConsultationFee = doctor.EmergencyConsultationFee,
                HomeVisitFee = doctor.HomeVisitFee,
                VideoConsultationFee = doctor.VideoConsultationFee,
                ConsultationDuration = doctor.ConsultationDuration,
                BufferTime = doctor.BufferTime,
                AdvanceBookingDays = doctor.AdvanceBookingDays,
                CancellationPolicy = doctor.CancellationPolicy,
                EmployeeId = doctor.EmployeeId,
                EmploymentStatus = doctor.EmploymentStatus,
                JoiningDate = doctor.JoiningDate,
                TerminationDate = doctor.TerminationDate,
                BankAccountDetails = doctor.BankAccountDetails,
                PaymentMethods = doctor.PaymentMethods,
                PanNumber = doctor.PanNumber,
                Gstin = doctor.Gstin,
                TotalPatientTreated = doctor.TotalPatientTreated,
                SuccessRate = doctor.SuccessRate,
                PatientSatisfactionScore = doctor.PatientSatisfactionScore,
                AverageRating = doctor.AverageRating,
                TotalReviews = doctor.TotalReviews,
                TotalSurgeriesPerformed = doctor.TotalSurgeriesPerformed
            };
        }
    }
}
