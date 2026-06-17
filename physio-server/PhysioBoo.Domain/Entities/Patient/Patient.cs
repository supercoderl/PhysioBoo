using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;
using Column = System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;

namespace PhysioBoo.Domain.Entities.PatientInformation
{
    [PlaceholderGroup("Patient", "patient", Order = 1)]
    public class Patient : TenantEntity
    {
        #region Core Patient Table (37)
        [Placeholder(Label = "Patient Number", Example = "PAT-2026-0001")]
        public string PatientNumber { get; private set; }

        [Placeholder(Label = "User ID", Example = "3f2504e0-4f89-41d3-9a0c-0305e82c3301")]
        public Guid? UserId { get; private set; }

        [Placeholder(Label = "Registration Date", Example = "2026-05-24")]
        public DateOnly? RegistrationDate { get; private set; }

        [Placeholder(Label = "Patient Type", Example = "Outpatient")]
        public PatientType PatientType { get; private set; }

        [Placeholder(Label = "Primary Doctor ID", Example = "8d12f4c7-4b9d-4f42-b6c8-1d7a5d7f9012")]
        public Guid PrimaryDoctorId { get; private set; }

        [Placeholder(Label = "Referred By", Example = "2d9bfc3d-9b55-4b24-a2d5-98e2b4fca101")]
        public Guid? ReferredBy { get; private set; }

        [Placeholder(Label = "Referral Hospital ID", Example = "a7c39f5d-9fd2-4f45-92f4-56a1d2f93c11")]
        public Guid? ReferralHospitalId { get; private set; }

        [Placeholder(Label = "Insurance Provider", Example = "AIA Vietnam")]
        public string? InssuranceProvider { get; private set; }

        [Placeholder(Label = "Insurance Policy Number", Example = "POL-INS-2026-001")]
        public string? InssurancePolicyNumber { get; private set; }

        [Placeholder(Label = "Insurance Expiry Date", Example = "2027-12-31")]
        public DateOnly? InssuranceExpiryDate { get; private set; }

        [Placeholder(Label = "Insurance Coverage Amount", Example = "50000000")]
        public decimal? InssuranceCoverageAmount { get; private set; }

        [Placeholder(Label = "VIP Patient", Example = "true")]
        public bool IsVip { get; private set; }

        [Placeholder(Label = "Senior Citizen", Example = "false")]
        public bool IsSeniorCitizen { get; private set; }

        [Placeholder(Label = "Chronic Patient", Example = "true")]
        public bool IsChronicPatient { get; private set; }

        [Placeholder(Label = "Medical History", Example = "Hypertension, Type 2 Diabetes")]
        public string? MedicalHistory { get; private set; }

        [Placeholder(Label = "Family History", Example = "Family history of heart disease")]
        public string? FamilyHistory { get; private set; }

        [Placeholder(Label = "Surgical History", Example = "Appendectomy in 2018")]
        public string? SurgicalHistory { get; private set; }

        [Placeholder(Label = "Allergy Information", Example = "Penicillin allergy")]
        public string? AllergyInformation { get; private set; }

        [Placeholder(Label = "Current Medications", Example = "Metformin 500mg daily")]
        public string? CurrentMedications { get; private set; }

        [Placeholder(Label = "Lifestyle Notes", Example = "Non-smoker, exercises twice weekly")]
        public string? LifestyleNotes { get; private set; }

        [Placeholder(Label = "Occupation", Example = "Software Engineer")]
        public string? Occupation { get; private set; }

        [Placeholder(Label = "Annual Income Range", Example = "20000-30000 USD")]
        public string? AnnualIncomeRange { get; private set; }

        [Placeholder(Label = "Preferred Hospital ID", Example = "5d1b72f8-6e2d-4e8a-b7d1-21b7a9e4f123")]
        public Guid? PreferredHospitalId { get; private set; }

        [Placeholder(Label = "Preferred Doctor ID", Example = "bc9f11d2-65d3-4e3f-a0f1-5c8b3c3e8f77")]
        public Guid? PreferredDoctorId { get; private set; }

        [Placeholder(Label = "Preferred Appointment Time", Example = "Morning (08:00 - 11:00)")]
        public string? PreferredAppointmentTime { get; private set; }

        [Placeholder(Label = "Communication Preferences", Example = "{\"sms\":true,\"email\":true}")]
        [Column(TypeName = "jsonb")]
        public string? CommunicationPreferences { get; private set; }

        [Placeholder(Label = "Consent For Research", Example = "true")]
        public bool ConsentForResearch { get; private set; }

        [Placeholder(Label = "Consent For Marketing", Example = "false")]
        public bool ConsentForMarketing { get; private set; }

        [Placeholder(Label = "Data Sharing Consent", Example = "true")]
        public bool DataSharingConsent { get; private set; }

        [Placeholder(Label = "Last Visit Date", Example = "2026-05-20 14:30:00")]
        public DateTime? LastVisitDate { get; private set; }

        [Placeholder(Label = "Next Follow Up Date", Example = "2026-06-15 09:00:00")]
        public DateTime? NextFollowUpDate { get; private set; }

        [Placeholder(Label = "Total Visits", Example = "12")]
        public int TotalVisits { get; private set; }

        [Placeholder(Label = "Total Amount Spent", Example = "12500000")]
        public decimal TotalAmountSpent { get; private set; }

        [Placeholder(Label = "Outstanding Balance", Example = "1500000")]
        public decimal OutstandingBalance { get; private set; }

        [Placeholder(Label = "Loyalty Points", Example = "350")]
        public int LoyaltyPoints { get; private set; }

        [Placeholder(Label = "Risk Level", Example = "High")]
        public RiskLevel RiskLevel { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual User? CreatedByUser { get; private set; }
        public virtual User? UpdatedByUser { get; private set; }
        public virtual Doctor? PrimaryDoctor { get; private set; }
        public virtual Doctor? ReferringDoctor { get; private set; }
        public virtual Hospital? ReferralHospital { get; private set; }
        public virtual Hospital? PreferredHospital { get; private set; }
        public virtual Doctor? PreferredDoctor { get; private set; }
        public virtual User? User { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();
        public virtual ICollection<PatientAllergy> Allergies { get; private set; } = new List<PatientAllergy>();
        public virtual ICollection<PatientMedicalHistory> MedicalHistories { get; private set; } = new List<PatientMedicalHistory>();
        public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        #endregion

        #region Constructor (37)
        public Patient(
            Guid id,
            string patientNumber,
            Guid? userId,
            Guid primaryDoctorId,
            Guid? referredBy,
            Guid? referralHospitalId,
            string? inssuranceProvider,
            string? inssurancePolicyNumber,
            DateOnly? inssuranceExpiryDate,
            decimal? inssuranceCoverageAmount,
            string? medicalHistory,
            string? familyHistory,
            string? surgicalHistory,
            string? allergyInformation,
            string? currentMedications,
            string? lifestyleNotes,
            string? occupation,
            string? annualIncomeRange,
            Guid? preferredHospitalId,
            Guid? preferredDoctorId,
            string? preferredAppointmentTime,
            string? communicationPreferences,
            DateTime? lastVisitDate,
            DateTime? nextFollowUpDate
        ) : base(id)
        {
            PatientNumber = patientNumber;
            UserId = userId;
            RegistrationDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            PatientType = PatientType.Outpatient;
            PrimaryDoctorId = primaryDoctorId;
            ReferredBy = referredBy;
            ReferralHospitalId = referralHospitalId;
            InssuranceProvider = inssuranceProvider;
            InssurancePolicyNumber = inssurancePolicyNumber;
            InssuranceExpiryDate = inssuranceExpiryDate;
            InssuranceCoverageAmount = inssuranceCoverageAmount;
            IsVip = false;
            IsSeniorCitizen = false;
            IsChronicPatient = false;
            MedicalHistory = medicalHistory;
            FamilyHistory = familyHistory;
            SurgicalHistory = surgicalHistory;
            AllergyInformation = allergyInformation;
            CurrentMedications = currentMedications;
            LifestyleNotes = lifestyleNotes;
            Occupation = occupation;
            AnnualIncomeRange = annualIncomeRange;
            PreferredHospitalId = preferredHospitalId;
            PreferredDoctorId = preferredDoctorId;
            PreferredAppointmentTime = preferredAppointmentTime;
            CommunicationPreferences = communicationPreferences;
            ConsentForResearch = false;
            ConsentForMarketing = false;
            DataSharingConsent = true;
            LastVisitDate = lastVisitDate;
            NextFollowUpDate = nextFollowUpDate;
            TotalVisits = 0;
            TotalAmountSpent = 0;
            OutstandingBalance = 0;
            LoyaltyPoints = 0;
            RiskLevel = RiskLevel.Low;
        }
        #endregion

        #region Setter Methods (37)
        public void SetPatientNumber(string patientNumber) { PatientNumber = patientNumber; }
        public void SetUserId(Guid? userId) { UserId = userId; }
        public void SetRegistrationDate(DateOnly? registrationDate) { RegistrationDate = registrationDate; }
        public void SetPatientType(PatientType patientType) { PatientType = patientType; }
        public void SetPrimaryDoctorId(Guid primaryDoctorId) { PrimaryDoctorId = primaryDoctorId; }
        public void SetReferredBy(Guid? referredBy) { ReferredBy = referredBy; }
        public void SetReferralHospitalId(Guid? referralHospitalId) { ReferralHospitalId = referralHospitalId; }
        public void SetInssuranceProvider(string? inssuranceProvider) { InssuranceProvider = inssuranceProvider; }
        public void SetInssurancePolicyNumber(string? inssurancePolicyNumber) { InssurancePolicyNumber = inssurancePolicyNumber; }
        public void SetInssuranceExpiryDate(DateOnly? inssuranceExpiryDate) { InssuranceExpiryDate = inssuranceExpiryDate; }
        public void SetInssuranceCoverageAmount(decimal? inssuranceCoverageAmount) { InssuranceCoverageAmount = inssuranceCoverageAmount; }
        public void SetIsVip(bool isVip) { IsVip = isVip; }
        public void SetIsSeniorCitizen(bool isSeniorCitizen) { IsSeniorCitizen = isSeniorCitizen; }
        public void SetIsChronicPatient(bool isChronicPatient) { IsChronicPatient = isChronicPatient; }
        public void SetMedicalHistory(string? medicalHistory) { MedicalHistory = medicalHistory; }
        public void SetFamilyHistory(string? familyHistory) { FamilyHistory = familyHistory; }
        public void SetSurgicalHistory(string? surgicalHistory) { SurgicalHistory = surgicalHistory; }
        public void SetAllergyInformation(string? allergyInformation) { AllergyInformation = allergyInformation; }
        public void SetCurrentMedications(string? currentMedications) { CurrentMedications = currentMedications; }
        public void SetLifestyleNotes(string? lifestyleNotes) { LifestyleNotes = lifestyleNotes; }
        public void SetOccupation(string? occupation) { Occupation = occupation; }
        public void SetAnnualIncomeRange(string? annualIncomeRange) { AnnualIncomeRange = annualIncomeRange; }
        public void SetPreferredHospitalId(Guid? preferredHospitalId) { PreferredHospitalId = preferredHospitalId; }
        public void SetPreferredDoctorId(Guid? preferredDoctorId) { PreferredDoctorId = preferredDoctorId; }
        public void SetPreferredAppointmentTime(string? preferredAppointmentTime) { PreferredAppointmentTime = preferredAppointmentTime; }
        public void SetCommunicationPreferences(string? communicationPreferences) { CommunicationPreferences = communicationPreferences; }
        public void SetConsentForResearch(bool consentForResearch) { ConsentForResearch = consentForResearch; }
        public void SetConsentForMarketing(bool consentForMarketing) { ConsentForMarketing = consentForMarketing; }
        public void SetDataSharingConsent(bool dataSharingConsent) { DataSharingConsent = dataSharingConsent; }
        public void SetLastVisitDate(DateTime? lastVisitDate) { LastVisitDate = lastVisitDate; }
        public void SetNextFollowUpDate(DateTime? nextFollowUpDate) { NextFollowUpDate = nextFollowUpDate; }
        public void SetTotalVisits(int totalVisits) { TotalVisits = totalVisits; }
        public void SetTotalAmountSpent(decimal totalAmountSpent) { TotalAmountSpent = totalAmountSpent; }
        public void SetOutstandingBalance(decimal outstandingBalance) { OutstandingBalance = outstandingBalance; }
        public void SetLoyaltyPoints(int loyaltyPoints) { LoyaltyPoints = loyaltyPoints; }
        public void SetRiskLevel(RiskLevel riskLevel) { RiskLevel = riskLevel; }
        #endregion
    }
}
