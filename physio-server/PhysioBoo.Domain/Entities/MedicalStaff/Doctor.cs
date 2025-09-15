using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class Doctor : Entity
    {
        #region Core Doctor Table (46)
        public string? EmployeeId { get; private set; }
        public string MedicalLicenseNumber { get; private set; }
        public DateOnly MedicalLicenseExpiry { get; private set; }
        public string? MedicalLicenseIssuingAuthority { get; private set; }
        public Guid? PrimarySpecialtyId { get; private set; }
        public int YearsOfExperience { get; private set; }
        public int YearsOfPractice { get; private set; }
        public decimal ConsultationFeeMin { get; private set; }
        public decimal ConsultationFeeMax { get; private set; }
        public decimal FollowUpFee { get; private set; }
        public decimal EmergencyConsultationFee { get; private set; }
        public decimal HomeVisitFee { get; private set; }
        public decimal VideoConsultationFee { get; private set; }
        public string[] LanguagesSpoken { get; private set; }
        public decimal SuccessRate { get; private set; } // percentage
        public decimal PatientSatisfactionScore { get; private set; } // out of 5
        public decimal AverageRating { get; private set; } // out of 5
        public int TotalReviews { get; private set; }
        public int TotalPatientTreated { get; private set; }
        public int TotalSurgeriesPerformed { get; private set; }
        public string? Bio { get; private set; }
        public string? About { get; private set; }
        public string? Archivements { get; private set; }
        public string? ResearchInterests { get; private set; }
        public int PublicationsCount { get; private set; }
        public int ConferencePresentations { get; private set; }
        public bool IsAvailableOnline { get; private set; }
        public bool IsAvailableHomeVisit { get; private set; }
        public bool IsAvailableEmergency { get; private set; }
        public int ConsultationDuration { get; private set; } // in minutes
        public int BufferTime { get; private set; } // in minutes
        public int AdvanceBookingDays { get; private set; }
        public string? CancellationPolicy { get; private set; }
        public string[] PaymentMethods { get; private set; }
        public string? BankAccountDetails { get; private set; }
        public string? PanNumber { get; private set; }
        public string? Gstin { get; private set; }
        public DateTime? JoiningDate { get; private set; }
        public DateTime? TerminationDate { get; private set; }
        public EmploymentStatus EmploymentStatus { get; private set; }
        public bool IsFeatured { get; private set; }
        public bool IsVerified { get; private set; }
        public TimeOnly? VerificationDate { get; private set; }
        public Guid? VerifiedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PrimarySpecialtyId")]
        [InverseProperty("Doctors")]
        public virtual DoctorSpecialty? PrimarySpecialty { get; private set; }

        [ForeignKey("VerifiedBy")]
        [InverseProperty("VerifiedDoctors")]
        public virtual User? VerifiedByUser { get; private set; }

        [InverseProperty("Doctor")]
        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

        [InverseProperty("ReferringDoctor")]
        public virtual ICollection<Appointment> ReferredAppointments { get; private set; } = new List<Appointment>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorAward> Awards { get; private set; } = new List<DoctorAward>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorCertification> Certifications { get; private set; } = new List<DoctorCertification>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorEducation> Educations { get; private set; } = new List<DoctorEducation>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorLeave> Leaves { get; private set; } = new List<DoctorLeave>();

        [InverseProperty("SubstituteDoctor")]
        public virtual ICollection<DoctorLeave> SubstitutedLeaves { get; private set; } = new List<DoctorLeave>();

        [InverseProperty("Doctor")] 
        public virtual ICollection<DoctorPublication> Publications { get; private set; } = new List<DoctorPublication>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorSchedule> Schedules { get; private set; } = new List<DoctorSchedule>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorSpecialty> Specialties { get; private set; } = new List<DoctorSpecialty>();

        [InverseProperty("Doctor")]
        public virtual ICollection<DoctorWorkExperience> WorkExperiences { get; private set; } = new List<DoctorWorkExperience>();

        [InverseProperty("Doctor")]
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();

        [InverseProperty("Doctor")]
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();

        [InverseProperty("Doctor")]
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();

        [InverseProperty("Doctor")]
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();

        [InverseProperty("PrimaryDoctor")]
        public virtual ICollection<Patient> Patients { get; private set; } = new List<Patient>();

        [InverseProperty("ReferringDoctor")]
        public virtual ICollection<Patient> ReferredPatients { get; private set; } = new List<Patient>();

        [InverseProperty("PreferredDoctor")]
        public virtual ICollection<Patient> PreferredPatients { get; private set; } = new List<Patient>();

        [InverseProperty("DiagnosedDoctor")]
        public virtual ICollection<PatientMedicalHistory> DiagnosedHistories { get; private set; } = new List<PatientMedicalHistory>();

        [InverseProperty("Doctor")]
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        #endregion

        #region Constructor (46)
        public Doctor(
            Guid id,
            string? employeeId,
            string medicalLicenseNumber,
            DateOnly medicalLicenseExpiry,
            string? medicalLicenseIssuingAuthority,
            Guid? primarySpecialtyId,
            string? bio,
            string? about,
            string? archivements,
            string? researchInterests,
            string? cancellationPolicy,
            string? bankAccountDetails,
            string? panNumber,
            string? gstin,
            DateTime? terminationDate,
            TimeOnly? verificationDate,
            Guid? verifiedBy
        ) : base(id)
        {
            EmployeeId = employeeId;
            MedicalLicenseNumber = medicalLicenseNumber;
            MedicalLicenseExpiry = medicalLicenseExpiry;
            MedicalLicenseIssuingAuthority = medicalLicenseIssuingAuthority;
            PrimarySpecialtyId = primarySpecialtyId;
            YearsOfExperience = 0; // Default to 0, can be updated later
            YearsOfPractice = 0; // Default to 0, can be updated later
            ConsultationFeeMin = 0; // Default to 0, can be updated later
            ConsultationFeeMax = 0; // Default to 0, can be updated later
            FollowUpFee = 0; // Default to 0, can be updated later
            EmergencyConsultationFee = 0; // Default to 0, can be updated later
            HomeVisitFee = 0; // Default to 0, can be updated later
            VideoConsultationFee = 0; // Default to 0, can be updated later
            LanguagesSpoken = Array.Empty<string>();
            SuccessRate = 0; // Default to 0, can be updated later
            PatientSatisfactionScore = 0; // Default to 0, can be updated later
            AverageRating = 0; // Default to 0, can be updated later
            TotalReviews = 0; // Default to 0, can be updated later
            TotalPatientTreated = 0; // Default to 0, can be updated later
            TotalSurgeriesPerformed = 0; // Default to 0, can be updated later
            Bio = bio;
            About = about;
            Archivements = archivements;
            ResearchInterests = researchInterests;
            PublicationsCount = 0; // Default to 0, can be updated later
            ConferencePresentations = 0; // Default to 0, can be updated later
            IsAvailableOnline = false; // Default to true, can be updated later
            IsAvailableHomeVisit = false; // Default to false, can be updated later
            IsAvailableEmergency = true; // Default to false, can be updated later 
            ConsultationDuration = 30; // Default to 30 minutes, can be updated later
            BufferTime = 10; // Default to 0, can be updated later
            AdvanceBookingDays = 30; // Default to 30 days, can be updated later
            CancellationPolicy = cancellationPolicy;
            PaymentMethods = Array.Empty<string>();
            BankAccountDetails = bankAccountDetails;
            PanNumber = panNumber;
            Gstin = gstin;
            JoiningDate = TimeZoneHelper.GetLocalTimeNow();
            TerminationDate = terminationDate;
            EmploymentStatus = EmploymentStatus.Active; // Default to Active, can be updated later
            IsFeatured = false; // Default to false, can be updated later
            IsVerified = false; // Default to false, can be updated later
            VerificationDate = verificationDate;
            VerifiedBy = verifiedBy;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion (46)

        #region Setter Methods (46)
        public void SetEmployeeId(string? employeeId) { EmployeeId = employeeId; }
        public void SetMedicalLicenseNumber(string medicalLicenseNumber) { MedicalLicenseNumber = medicalLicenseNumber; }
        public void SetMedicalLicenseExpiry(DateOnly medicalLicenseExpiry) { MedicalLicenseExpiry = medicalLicenseExpiry; }
        public void SetMedicalLicenseIssuingAuthority(string? medicalLicenseIssuingAuthority) { MedicalLicenseIssuingAuthority = medicalLicenseIssuingAuthority; }
        public void SetPrimarySpecialtyId(Guid? primarySpecialtyId) { PrimarySpecialtyId = primarySpecialtyId; }
        public void SetYearsOfExperience(int yearsOfExperience) { YearsOfExperience = yearsOfExperience; }
        public void SetYearsOfPractice(int yearsOfPractice) { YearsOfPractice = yearsOfPractice; }
        public void SetConsultationFeeMin(decimal consultationFeeMin) { ConsultationFeeMin = consultationFeeMin; }
        public void SetConsultationFeeMax(decimal consultationFeeMax) { ConsultationFeeMax = consultationFeeMax; }
        public void SetFollowUpFee(decimal followUpFee) { FollowUpFee = followUpFee; }
        public void SetEmergencyConsultationFee(decimal emergencyConsultationFee) { EmergencyConsultationFee = emergencyConsultationFee; }
        public void SetHomeVisitFee(decimal homeVisitFee) { HomeVisitFee = homeVisitFee; }
        public void SetVideoConsultationFee(decimal videoConsultationFee) { VideoConsultationFee = videoConsultationFee; }
        public void SetLanguagesSpoken(string[] languagesSpoken) { LanguagesSpoken = languagesSpoken; }
        public void SetSuccessRate(decimal successRate) { SuccessRate = successRate; }
        public void SetPatientSatisfactionScore(decimal patientSatisfactionScore) { PatientSatisfactionScore = patientSatisfactionScore; }
        public void SetAverageRating(decimal averageRating) { AverageRating = averageRating; }
        public void SetTotalReviews(int totalReviews) { TotalReviews = totalReviews; }
        public void SetTotalPatientTreated(int totalPatientTreated) { TotalPatientTreated = totalPatientTreated; }
        public void SetTotalSurgeriesPerformed(int totalSurgeriesPerformed) { TotalSurgeriesPerformed = totalSurgeriesPerformed; }
        public void SetBio(string? bio) { Bio = bio; }
        public void SetAbout(string? about) { About = about; }
        public void SetArchivements(string? archivements) { Archivements = archivements; }
        public void SetResearchInterests(string? researchInterests) { ResearchInterests = researchInterests; }
        public void SetPublicationsCount(int publicationsCount) { PublicationsCount = publicationsCount; }
        public void SetConferencePresentations(int conferencePresentations) { ConferencePresentations = conferencePresentations; }
        public void SetIsAvailableOnline(bool isAvailableOnline) { IsAvailableOnline = isAvailableOnline; }
        public void SetIsAvailableHomeVisit(bool isAvailableHomeVisit) { IsAvailableHomeVisit = isAvailableHomeVisit; }
        public void SetIsAvailableEmergency(bool isAvailableEmergency) { IsAvailableEmergency = isAvailableEmergency; }
        public void SetConsultationDuration(int consultationDuration) { ConsultationDuration = consultationDuration; }
        public void SetBufferTime(int bufferTime) { BufferTime = bufferTime; }
        public void SetAdvanceBookingDays(int advanceBookingDays) { AdvanceBookingDays = advanceBookingDays; }
        public void SetCancellationPolicy(string? cancellationPolicy) { CancellationPolicy = cancellationPolicy; }
        public void SetPaymentMethods(string[] paymentMethods) { PaymentMethods = paymentMethods; }
        public void SetBankAccountDetails(string? bankAccountDetails) { BankAccountDetails = bankAccountDetails; }
        public void SetPanNumber(string? panNumber) { PanNumber = panNumber; }
        public void SetGstin(string? gstin) { Gstin = gstin; }
        public void SetJoiningDate(DateTime? joiningDate) { JoiningDate = joiningDate; }
        public void SetTerminationDate(DateTime? terminationDate) { TerminationDate = terminationDate; }
        public void SetEmploymentStatus(EmploymentStatus employmentStatus) { EmploymentStatus = employmentStatus; }
        public void SetIsFeatured(bool isFeatured) { IsFeatured = isFeatured; }
        public void SetIsVerified(bool isVerified) { IsVerified = isVerified; }
        public void SetVerificationDate(TimeOnly? verificationDate) { VerificationDate = verificationDate; }
        public void SetVerifiedBy(Guid? verifiedBy) { VerifiedBy = verifiedBy; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
