using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.PatientInformation
{
    public class Patient : Entity
    {
        #region Core Patient Table (37)
        public string PatientNumber { get; private set; }
        public DateOnly? RegistrationDate { get; private set; }
        public PatientType PatientType { get; private set; }
        public Guid PrimaryDoctorId { get; private set; }
        public Guid? ReferredBy { get; private set; }
        public Guid? ReferralHospitalId { get; private set; }
        public string? InssuranceProvider { get; private set; }
        public string? InssurancePolicyNumber { get; private set; }
        public DateOnly? InssuranceExpiryDate { get; private set; }
        public decimal? InssuranceCoverageAmount { get; private set; }
        public bool IsVip { get; private set; }
        public bool IsSeniorCitizen { get; private set; }
        public bool IsChronicPatient { get; private set; }
        public string? MedicalHistory { get; private set; }
        public string? FamilyHistory { get; private set; }
        public string? SurgicalHistory { get; private set; }
        public string? AllergyInformation { get; private set; }
        public string? CurrentMedications { get; private set; }
        public string? LifestyleNotes { get; private set; }
        public string? Occupation { get; private set; }
        public string? AnnualIncomeRange { get; private set; }
        public Guid? PreferredHospitalId { get; private set; }
        public Guid? PreferredDoctorId { get; private set; }
        public string? PreferredAppointmentTime { get; private set; }

        [Column(TypeName = "jsonb")]
        public string? CommunicationPreferences { get; private set; } // JSONB

        public bool ConsentForResearch { get; private set; }
        public bool ConsentForMarketing { get; private set; }
        public bool DataSharingConsent { get; private set; }
        public DateTime? LastVisitDate { get; private set; }
        public DateTime? NextFollowUpDate { get; private set; }
        public int TotalVisits { get; private set; }
        public decimal TotalAmountSpent { get; private set; }
        public decimal OutstandingBalance { get; private set; }
        public int LoyaltyPoints { get; private set; }
        public RiskLevel RiskLevel { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PrimaryDoctorId")]
        [InverseProperty("Patients")]
        public virtual Doctor? PrimaryDoctor { get; private set; }

        [ForeignKey("ReferredBy")]
        [InverseProperty("ReferredPatients")]
        public virtual Doctor? ReferringDoctor { get; private set; }

        [ForeignKey("ReferralHospitalId")]
        [InverseProperty("ReferredPatients")]
        public virtual Hospital? ReferralHospital { get; private set; }

        [ForeignKey("PreferredHospitalId")]
        [InverseProperty("PreferredPatients")]
        public virtual Hospital? PreferredHospital { get; private set; }

        [ForeignKey("PreferredDoctorId")]
        [InverseProperty("PreferredPatients")]
        public virtual Doctor? PreferredDoctor { get; private set; }

        [InverseProperty("Patient")]
        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

        [InverseProperty("Patient")]
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();

        [InverseProperty("Patient")]
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();

        [InverseProperty("Patient")]
        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();

        [InverseProperty("Patient")]
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();

        [InverseProperty("Patient")]
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();

        [InverseProperty("Patient")]
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();

        [InverseProperty("Patient")]
        public virtual ICollection<PatientAllergy> Allergies { get; private set; } = new List<PatientAllergy>();

        [InverseProperty("Patient")]
        public virtual ICollection<PatientMedicalHistory> MedicalHistories { get; private set; } = new List<PatientMedicalHistory>();

        [InverseProperty("Patient")]
        public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();

        [InverseProperty("Patient")]
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();    
        #endregion

        #region Constructor (37)
        public Patient(
            Guid id,
            string patientNumber,
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
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (37)
        public void SetPatientNumber(string patientNumber) { PatientNumber = patientNumber; }
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
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
