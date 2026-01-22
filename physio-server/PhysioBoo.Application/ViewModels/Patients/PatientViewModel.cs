using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Patients
{
    public sealed class PatientViewModel
    {
        public Guid Id { get; set; }
        public string PatientNumber { get; set; } = string.Empty;
        public PatientType PatientType { get; set; }
        public string? Occupation { get; set; }
        public string? AnnualIncomeRange { get; set; }
        public bool IsVip { get; set; }
        public bool IsSeniorCitizen { get; set; }
        public Guid? ReferredBy { get; set; }
        public Guid? ReferralHospitalId { get; set; }
        public string? MedicalHistory { get; set; }
        public string? FamilyHistory { get; set; }
        public string? SurgicalHistory { get; set; }
        public string? AllergyInformation { get; set; }
        public string? CurrentMedications { get; set; }
        public string? LifestyleNotes { get; set; }
        public bool IsChronicPatient { get; set; }
        public RiskLevel RiskLevel { get; set; }
        public string? InssuranceProvider { get; set; }
        public string? InssurancePolicyNumber { get; set; }
        public DateOnly? InssuranceExpiryDate { get; set; }
        public decimal? InssuranceCoverageAmount { get; set; }
        public decimal TotalAmountSpent { get; set; }
        public decimal OutstandingBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public Guid PrimaryDoctorId { get; set; }
        public Guid? PreferredDoctorId { get; set; }
        public Guid? PreferredHospitalId { get; set; }
        public string? PreferredAppointmentTime { get; set; }
        public string? CommunicationPreferences { get; set; }
        public bool ConsentForResearch { get; set; }
        public bool ConsentForMarketing { get; set; }
        public bool DataSharingConsent { get; set; }
        public DateOnly? RegistrationDate { get; set; }
        public DateTime? LastVisitDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public int TotalVisits { get; set; }


        public static PatientViewModel FromPatient(Patient patient)
        {
            return new PatientViewModel
            {
                Id = patient.Id,
                PatientNumber = patient.PatientNumber,
                PatientType = patient.PatientType,
                Occupation = patient.Occupation,
                AnnualIncomeRange = patient.AnnualIncomeRange,
                IsVip = patient.IsVip,
                IsSeniorCitizen = patient.IsSeniorCitizen,
                ReferredBy = patient.ReferredBy,
                ReferralHospitalId = patient.ReferralHospitalId,
                MedicalHistory = patient.MedicalHistory,
                FamilyHistory = patient.FamilyHistory,
                SurgicalHistory = patient.SurgicalHistory,
                AllergyInformation = patient.AllergyInformation,
                CurrentMedications = patient.CurrentMedications,
                LifestyleNotes = patient.LifestyleNotes,
                IsChronicPatient = patient.IsChronicPatient,
                RiskLevel = patient.RiskLevel,
                InssuranceProvider = patient.InssuranceProvider,
                InssurancePolicyNumber = patient.InssurancePolicyNumber,
                InssuranceExpiryDate = patient.InssuranceExpiryDate,
                InssuranceCoverageAmount = patient.InssuranceCoverageAmount,
                TotalAmountSpent = patient.TotalAmountSpent,
                OutstandingBalance = patient.OutstandingBalance,
                LoyaltyPoints = patient.LoyaltyPoints,
                PrimaryDoctorId = patient.PrimaryDoctorId,
                PreferredDoctorId = patient.PreferredDoctorId,
                PreferredHospitalId = patient.PreferredHospitalId,
                PreferredAppointmentTime = patient.PreferredAppointmentTime,
                CommunicationPreferences = patient.CommunicationPreferences,
                ConsentForResearch = patient.ConsentForResearch,
                ConsentForMarketing = patient.ConsentForMarketing,
                DataSharingConsent = patient.DataSharingConsent,
                RegistrationDate = patient.RegistrationDate,
                LastVisitDate = patient.LastVisitDate,
                NextFollowUpDate = patient.NextFollowUpDate,
                TotalVisits = patient.TotalVisits,
            };
        }
    }
}
