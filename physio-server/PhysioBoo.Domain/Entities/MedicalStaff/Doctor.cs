using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;
using Column = System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    [PlaceholderGroup("Doctor", "doctor", Order = 2)]
    public class Doctor : TenantEntity
    {
        #region Core Doctor Table (46)
        [Placeholder(Label = "Employee ID", Example = "EMP-2026-0001")]
        public string? EmployeeId { get; private set; }

        [Placeholder(Label = "Medical License Number", Example = "MLN-2026-889921")]
        public string MedicalLicenseNumber { get; private set; }

        [Placeholder(Label = "Medical License Expiry", Example = "2030-12-31")]
        public DateOnly MedicalLicenseExpiry { get; private set; }

        [Placeholder(Label = "Medical License Issuing Authority", Example = "Vietnam Medical Association")]
        public string? MedicalLicenseIssuingAuthority { get; private set; }

        [Placeholder(Label = "Primary Specialty ID", Example = "7c9b1d2f-3a9e-4c3f-8d11-2e7f8a9b4561")]
        public Guid? PrimarySpecialtyId { get; private set; }

        [Placeholder(Label = "Department ID", Example = "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f")]
        public Guid? DepartmentId { get; private set; }

        [Placeholder(Label = "Room ID", Example = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d")]
        public Guid? RoomId { get; private set; }

        [Placeholder(Label = "Years Of Experience", Example = "12")]
        public int YearsOfExperience { get; private set; }

        [Placeholder(Label = "Years Of Practice", Example = "10")]
        public int YearsOfPractice { get; private set; }

        [Placeholder(Label = "Consultation Fee Min", Example = "500000")]
        public decimal ConsultationFeeMin { get; private set; }

        [Placeholder(Label = "Consultation Fee Max", Example = "1200000")]
        public decimal ConsultationFeeMax { get; private set; }

        [Placeholder(Label = "Follow Up Fee", Example = "300000")]
        public decimal FollowUpFee { get; private set; }

        [Placeholder(Label = "Emergency Consultation Fee", Example = "1500000")]
        public decimal EmergencyConsultationFee { get; private set; }

        [Placeholder(Label = "Home Visit Fee", Example = "800000")]
        public decimal HomeVisitFee { get; private set; }

        [Placeholder(Label = "Video Consultation Fee", Example = "250000")]
        public decimal VideoConsultationFee { get; private set; }

        [Placeholder(Label = "Languages Spoken", Example = "English, Vietnamese, French")]
        public string[] LanguagesSpoken { get; private set; }

        [Placeholder(Label = "Success Rate", Example = "96.5%")]
        public decimal SuccessRate { get; private set; } // percentage

        [Placeholder(Label = "Patient Satisfaction Score", Example = "4.8")]
        public decimal PatientSatisfactionScore { get; private set; } // out of 5

        [Placeholder(Label = "Average Rating", Example = "4.7")]
        public decimal AverageRating { get; private set; } // out of 5

        [Placeholder(Label = "Total Reviews", Example = "428")]
        public int TotalReviews { get; private set; }

        [Placeholder(Label = "Total Patient Treated", Example = "3200")]
        public int TotalPatientTreated { get; private set; }

        [Placeholder(Label = "Total Surgeries Performed", Example = "186")]
        public int TotalSurgeriesPerformed { get; private set; }

        [Placeholder(Label = "Bio", Example = "Board-certified cardiologist with 12 years of clinical experience.")]
        public string? Bio { get; private set; }

        [Placeholder(Label = "About", Example = "Specializes in internal medicine, preventive care, and chronic disease management.")]
        public string? About { get; private set; }

        [Placeholder(Label = "Achievements", Example = "Completed over 150 successful complex procedures.")]
        public string? Archivements { get; private set; }

        [Placeholder(Label = "Research Interests", Example = "Cardiovascular disease, preventive medicine, telehealth")]
        public string? ResearchInterests { get; private set; }

        [Placeholder(Label = "Publications Count", Example = "18")]
        public int PublicationsCount { get; private set; }

        [Placeholder(Label = "Conference Presentations", Example = "24")]
        public int ConferencePresentations { get; private set; }

        [Placeholder(Label = "Is Available Online", Example = "true")]
        public bool IsAvailableOnline { get; private set; }

        [Placeholder(Label = "Is Available Home Visit", Example = "false")]
        public bool IsAvailableHomeVisit { get; private set; }

        [Placeholder(Label = "Is Available Emergency", Example = "true")]
        public bool IsAvailableEmergency { get; private set; }

        [Placeholder(Label = "Consultation Duration", Example = "30 minutes")]
        public int ConsultationDuration { get; private set; } // in minutes

        [Placeholder(Label = "Buffer Time", Example = "15 minutes")]
        public int BufferTime { get; private set; } // in minutes

        [Placeholder(Label = "Advance Booking Days", Example = "30")]
        public int AdvanceBookingDays { get; private set; }

        [Placeholder(Label = "Cancellation Policy", Example = "Free cancellation up to 24 hours before appointment.")]
        public string? CancellationPolicy { get; private set; }

        [Placeholder(Label = "Payment Methods", Example = "Cash, Bank Transfer, Credit Card")]
        public string[] PaymentMethods { get; private set; }

        [Placeholder(Label = "Bank Account Details", Example = "{\"bankName\":\"Vietcombank\",\"accountNumber\":\"0123456789\",\"accountName\":\"Dr. Nguyen Van A\"}")]
        [Column("BankAccountDetails", TypeName = "jsonb")]
        public string? BankAccountDetails { get; private set; }

        [Placeholder(Label = "PAN Number", Example = "ABCDE1234F")]
        public string? PanNumber { get; private set; }

        [Placeholder(Label = "GSTIN", Example = "29ABCDE1234F1Z5")]
        public string? Gstin { get; private set; }

        [Placeholder(Label = "Joining Date", Example = "2024-01-15 09:00:00")]
        public DateTime? JoiningDate { get; private set; }

        [Placeholder(Label = "Termination Date", Example = "2026-12-31 17:30:00")]
        public DateTime? TerminationDate { get; private set; }

        [Placeholder(Label = "Employment Status", Example = "Active")]
        public EmploymentStatus EmploymentStatus { get; private set; }

        [Placeholder(Label = "Is Featured", Example = "true")]
        public bool IsFeatured { get; private set; }

        [Placeholder(Label = "Is Verified", Example = "true")]
        public bool IsVerified { get; private set; }

        [Placeholder(Label = "Verification Time", Example = "10:30 AM")]
        public TimeOnly? VerificationDate { get; private set; }

        [Placeholder(Label = "Verified By", Example = "d4c3b2a1-9f8e-4d7c-8b6a-1f2e3d4c5b6a")]
        public Guid? VerifiedBy { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual User? CreatedByUser { get; private set; }
        public virtual User? UpdatedByUser { get; private set; }
        public virtual DoctorSpecialty? PrimarySpecialty { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual Room? Room { get; private set; }
        public virtual User? VerifiedByUser { get; private set; }
        public virtual User? User { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Appointment> ReferredAppointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<DoctorAward> Awards { get; private set; } = new List<DoctorAward>();
        public virtual ICollection<DoctorCertification> Certifications { get; private set; } = new List<DoctorCertification>();
        public virtual ICollection<DoctorEducation> Educations { get; private set; } = new List<DoctorEducation>();
        public virtual ICollection<DoctorLeave> Leaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<DoctorLeave> SubstitutedLeaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<DoctorPublication> Publications { get; private set; } = new List<DoctorPublication>();
        public virtual ICollection<DoctorSchedule> Schedules { get; private set; } = new List<DoctorSchedule>();
        public virtual ICollection<DoctorSpecialty> Specialties { get; private set; } = new List<DoctorSpecialty>();
        public virtual ICollection<DoctorWorkExperience> WorkExperiences { get; private set; } = new List<DoctorWorkExperience>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();
        public virtual ICollection<Patient> Patients { get; private set; } = new List<Patient>();
        public virtual ICollection<Patient> ReferredPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<Patient> PreferredPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<PatientMedicalHistory> DiagnosedHistories { get; private set; } = new List<PatientMedicalHistory>();
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
            string? bankAccountDetails,
            string? panNumber,
            string? gstin
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
            LanguagesSpoken = new string[] { "English" };
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
            PaymentMethods = new string[] { "Card" };
            BankAccountDetails = bankAccountDetails;
            PanNumber = panNumber;
            Gstin = gstin;
            JoiningDate = TimeZoneHelper.GetLocalTimeNow();
            EmploymentStatus = EmploymentStatus.Active; // Default to Active, can be updated later
            IsFeatured = false; // Default to false, can be updated later
            IsVerified = false; // Default to false, can be updated later
        }
        #endregion (46)

        #region Setter Methods (46)
        public void SetEmployeeId(string? employeeId) { EmployeeId = employeeId; }
        public void SetMedicalLicenseNumber(string medicalLicenseNumber) { MedicalLicenseNumber = medicalLicenseNumber; }
        public void SetMedicalLicenseExpiry(DateOnly medicalLicenseExpiry) { MedicalLicenseExpiry = medicalLicenseExpiry; }
        public void SetMedicalLicenseIssuingAuthority(string? medicalLicenseIssuingAuthority) { MedicalLicenseIssuingAuthority = medicalLicenseIssuingAuthority; }
        public void SetPrimarySpecialtyId(Guid? primarySpecialtyId) { PrimarySpecialtyId = primarySpecialtyId; }
        public void SetDepartmentId(Guid? departmentId) { DepartmentId = departmentId; }
        public void SetRoomId(Guid? roomId) { RoomId = roomId; }
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
        #endregion
    }
}
