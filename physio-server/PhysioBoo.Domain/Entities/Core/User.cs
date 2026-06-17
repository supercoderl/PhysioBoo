using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class User : TenantEntity
    {
        #region Core User Table (20)
        public string Email { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public string? EmailNormalized { get; private set; }

        public string Phone { get; private set; }
        public string? AlternatePhone { get; private set; }
        public string PasswordHash { get; private set; }
        public bool IsActive { get; private set; }
        public bool IsVerified { get; private set; }
        public DateTime? EmailVerifiedAt { get; private set; }
        public DateTime? PhoneVerifiedAt { get; private set; }
        public DateTime? LastLoginAt { get; private set; }
        public int FailedLoginAttempts { get; private set; }
        public DateTime? AccountLockedUntil { get; private set; }
        public bool TwoFactorEnabled { get; private set; }
        public string? TwoFactorSecret { get; private set; }
        public string? ProfilePicture { get; private set; }
        public string PreferredLanguage { get; private set; }
        public string TimeZone { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }

        public virtual Doctor? Doctor { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual Profile? Profile { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<User> CreatedUsers { get; private set; } = new List<User>();
        public virtual ICollection<User> UpdatedUsers { get; private set; } = new List<User>();
        public virtual ICollection<Address> Addresses { get; private set; } = new List<Address>();
        public virtual ICollection<Appointment> CancelledAppointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Appointment> CreatedAppointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Appointment> UpdatedAppointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Bill> CreatedBills { get; private set; } = new List<Bill>();
        public virtual ICollection<Bill> UpdatedBills { get; private set; } = new List<Bill>();
        public virtual ICollection<Bill> ApprovedBills { get; private set; } = new List<Bill>();
        public virtual ICollection<BillItem> PerformedBillItems { get; private set; } = new List<BillItem>();
        public virtual ICollection<Department> HeadedDepartments { get; private set; } = new List<Department>();
        public virtual ICollection<Doctor> VerifiedDoctors { get; private set; } = new List<Doctor>();
        public virtual ICollection<DoctorLeave> ApprovedLeaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<HospitalStaff> HospitalStaffs { get; private set; } = new List<HospitalStaff>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingOrder> RadiologistImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingOrder> CreatedImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingOrder> UpdatedImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();
        public virtual ICollection<LabOrder> CreatedLabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<LabOrderItem> CollectedLabSamples { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<LabOrderItem> ProcessedLabTests { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<LabOrderItem> VerifiedLabTests { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<LabReport> PathologistLabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<MedicalRecord> CreatedMedicalRecords { get; private set; } = new HashSet<MedicalRecord>();
        public virtual ICollection<MedicalRecord> UpdatedMedicalRecords { get; private set; } = new HashSet<MedicalRecord>();
        public virtual ICollection<Payment> ProcessedPayments { get; private set; } = new List<Payment>();
        public virtual ICollection<Review> Reviews { get; private set; } = new List<Review>();
        public virtual ICollection<Review> ModeratedReviews { get; private set; } = new List<Review>();
        public virtual ICollection<Review> Responses { get; private set; } = new List<Review>();
        public virtual ICollection<VerificationToken> VerificationTokens { get; private set; } = new List<VerificationToken>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();
        public virtual ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
        public virtual ICollection<UserRole> AssignedUserRoles { get; private set; } = new List<UserRole>();
        public virtual ICollection<AdminMenu> CreatedMenus { get; private set; } = new List<AdminMenu>();
        public virtual ICollection<AdminMenu> UpdatedMenus { get; private set; } = new List<AdminMenu>();
        public virtual ICollection<UserLogin> UserLogins { get; private set; } = new List<UserLogin>();
        public virtual ICollection<Sys_Device> Sys_Devices { get; private set; } = new List<Sys_Device>();
        public virtual ICollection<PrintTemplate> CreatedPrintTemplates { get; private set; } = new List<PrintTemplate>();
        public virtual ICollection<PrintTemplate> UpdatedPrintTemplates { get; private set; } = new List<PrintTemplate>();
        public virtual ICollection<PrintTemplateVersion> CreatedPrintTemplateVersions { get; private set; } = new List<PrintTemplateVersion>();
        public virtual ICollection<PrintTemplateVersion> UpdatedPrintTemplateVersions { get; private set; } = new List<PrintTemplateVersion>();
        public virtual ICollection<PrintLog> PrintLogs { get; private set; } = new List<PrintLog>();
        public virtual ICollection<Sys_SequenceTracker> CreatedSequenceTrackers { get; private set; } = new List<Sys_SequenceTracker>();
        public virtual ICollection<Sys_SequenceTracker> UpdatedSequenceTrackers { get; private set; } = new List<Sys_SequenceTracker>();
        public virtual ICollection<Prescription> CreatedPrescriptions { get; private set; } = new List<Prescription>();
        public virtual ICollection<Prescription> UpdatedPrescriptions { get; private set; } = new List<Prescription>();
        public virtual ICollection<Payment> CreatedPayments { get; private set; } = new List<Payment>();
        public virtual ICollection<Payment> UpdatedPayments { get; private set; } = new List<Payment>();
        public virtual ICollection<LabReport> CreatedLabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<LabReport> UpdatedLabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<ImagingReport> CreatedImagingReports { get; private set; } = new List<ImagingReport>();
        public virtual ICollection<ImagingReport> UpdatedImagingReports { get; private set; } = new List<ImagingReport>();
        public virtual ICollection<HospitalStaff> CreatedHospitalStaffs { get; private set; } = new List<HospitalStaff>();
        public virtual ICollection<HospitalStaff> UpdatedHospitalStaffs { get; private set; } = new List<HospitalStaff>();
        public virtual ICollection<DoctorSchedule> CreatedDoctorSchedules { get; private set; } = new List<DoctorSchedule>();
        public virtual ICollection<DoctorSchedule> UpdatedDoctorSchedules { get; private set; } = new List<DoctorSchedule>();
        public virtual ICollection<DoctorLeave> CreatedDoctorLeaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<DoctorLeave> UpdatedDoctorLeaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<Medicine> CreatedMedicines { get; private set; } = new List<Medicine>();
        public virtual ICollection<Medicine> UpdatedMedicines { get; private set; } = new List<Medicine>();
        public virtual ICollection<MedicineCategory> CreatedMedicineCategories { get; private set; } = new List<MedicineCategory>();
        public virtual ICollection<MedicineCategory> UpdatedMedicineCategories { get; private set; } = new List<MedicineCategory>();
        public virtual ICollection<MedicineInventory> CreatedMedicineInventories { get; private set; } = new List<MedicineInventory>();
        public virtual ICollection<MedicineInventory> UpdatedMedicineInventories { get; private set; } = new List<MedicineInventory>();
        public virtual ICollection<PrescriptionItem> CreatedPrescriptionItems { get; private set; } = new List<PrescriptionItem>();
        public virtual ICollection<PrescriptionItem> UpdatedPrescriptionItems { get; private set; } = new List<PrescriptionItem>();
        public virtual ICollection<Address> CreatedAddresses { get; private set; } = new List<Address>();
        public virtual ICollection<Address> UpdatedAddresses { get; private set; } = new List<Address>();
        public virtual ICollection<Profile> CreatedProfiles { get; private set; } = new List<Profile>();
        public virtual ICollection<Profile> UpdatedProfiles { get; private set; } = new List<Profile>();
        public virtual ICollection<Role> CreatedRoles { get; private set; } = new List<Role>();
        public virtual ICollection<Role> UpdatedRoles { get; private set; } = new List<Role>();
        public virtual ICollection<LabOrderItem> CreatedLabOrderItems { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<LabOrderItem> UpdatedLabOrderItems { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<DoctorAward> CreatedDoctorAwards { get; private set; } = new List<DoctorAward>();
        public virtual ICollection<DoctorAward> UpdatedDoctorAwards { get; private set; } = new List<DoctorAward>();
        public virtual ICollection<DoctorCertification> CreatedDoctorCertifications { get; private set; } = new List<DoctorCertification>();
        public virtual ICollection<DoctorCertification> UpdatedDoctorCertifications { get; private set; } = new List<DoctorCertification>();
        public virtual ICollection<DoctorEducation> CreatedDoctorEducations { get; private set; } = new List<DoctorEducation>();
        public virtual ICollection<DoctorEducation> UpdatedDoctorEducations { get; private set; } = new List<DoctorEducation>();
        public virtual ICollection<DoctorPublication> CreatedDoctorPublications { get; private set; } = new List<DoctorPublication>();
        public virtual ICollection<DoctorPublication> UpdatedDoctorPublications { get; private set; } = new List<DoctorPublication>();
        public virtual ICollection<DoctorSpecialty> CreatedDoctorSpecialties { get; private set; } = new List<DoctorSpecialty>();
        public virtual ICollection<DoctorSpecialty> UpdatedDoctorSpecialties { get; private set; } = new List<DoctorSpecialty>();
        public virtual ICollection<DoctorWorkExperience> CreatedDoctorWorkExperiences { get; private set; } = new List<DoctorWorkExperience>();
        public virtual ICollection<DoctorWorkExperience> UpdatedDoctorWorkExperiences { get; private set; } = new List<DoctorWorkExperience>();
        public virtual ICollection<BillItem> CreatedBillItems { get; private set; } = new List<BillItem>();
        public virtual ICollection<BillItem> UpdatedBillItems { get; private set; } = new List<BillItem>();
        public virtual ICollection<Department> CreatedDepartments { get; private set; } = new List<Department>();
        public virtual ICollection<Department> UpdatedDepartments { get; private set; } = new List<Department>();
        public virtual ICollection<Hospital> CreatedHospitals { get; private set; } = new List<Hospital>();
        public virtual ICollection<Hospital> UpdatedHospitals { get; private set; } = new List<Hospital>();
        public virtual ICollection<HospitalGroup> CreatedHospitalGroups { get; private set; } = new List<HospitalGroup>();
        public virtual ICollection<HospitalGroup> UpdatedHospitalGroups { get; private set; } = new List<HospitalGroup>();
        public virtual ICollection<Patient> CreatedPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<Patient> UpdatedPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<PatientAllergy> CreatedPatientAllergies { get; private set; } = new List<PatientAllergy>();
        public virtual ICollection<PatientAllergy> UpdatedPatientAllergies { get; private set; } = new List<PatientAllergy>();
        public virtual ICollection<PatientMedicalHistory> CreatedPatientMedicalHistories { get; private set; } = new List<PatientMedicalHistory>();
        public virtual ICollection<PatientMedicalHistory> UpdatedPatientMedicalHistories { get; private set; } = new List<PatientMedicalHistory>();
        public virtual ICollection<Doctor> CreatedDoctors { get; private set; } = new List<Doctor>();
        public virtual ICollection<Doctor> UpdatedDoctors { get; private set; } = new List<Doctor>();
        public virtual ICollection<Review> CreatedReviews { get; private set; } = new List<Review>();
        public virtual ICollection<Review> UpdatedReviews { get; private set; } = new List<Review>();
        public virtual ICollection<UserPreference> UserPreferences { get; private set; } = new List<UserPreference>();
        #endregion

        #region Constructor (20)
        public User(
            Guid id,
            string email,
            string phone,
            string passwordHash
        ) : base(id)
        {
            Email = email;
            Phone = phone;
            AlternatePhone = null;
            PasswordHash = passwordHash;
            IsActive = true;
            IsVerified = false;
            EmailVerifiedAt = null;
            PhoneVerifiedAt = null;
            LastLoginAt = null;
            FailedLoginAttempts = 0;
            AccountLockedUntil = null;
            TwoFactorEnabled = false;
            TwoFactorSecret = null;
            ProfilePicture = null;
            PreferredLanguage = "en";
            TimeZone = "Asia/Ho_Chi_Minh";
        }
        #endregion

        #region Setter Methods (20)
        public void SetEmail(string email) { Email = email; }
        public void SetPhone(string phone) { Phone = phone; }
        public void SetAlternatePhone(string? alternatePhone) { AlternatePhone = alternatePhone; }
        public void SetPassword(string passwordHash) { PasswordHash = passwordHash; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetIsVerified(bool isVerified) { IsVerified = isVerified; }
        public void SetEmailVerifiedAt(DateTime? emailVerifiedAt) { EmailVerifiedAt = emailVerifiedAt; }
        public void SetPhoneVerifiedAt(DateTime? phoneVerifiedAt) { PhoneVerifiedAt = phoneVerifiedAt; }
        public void SetLastLoginAt(DateTime? lastLoginAt) { LastLoginAt = lastLoginAt; }
        public void SetFailedLoginAttempts(int failedLoginAttempts) { FailedLoginAttempts = failedLoginAttempts; }
        public void SetAccountLockedUntil(DateTime? accountLockedUntil) { AccountLockedUntil = accountLockedUntil; }
        public void SetTwoFactorEnabled(bool twoFactorEnabled) { TwoFactorEnabled = twoFactorEnabled; }
        public void SetTwoFactorSecret(string? twoFactorSecret) { TwoFactorSecret = twoFactorSecret; }
        public void SetProfilePicture(string? profilePicture) { ProfilePicture = profilePicture; }
        public void SetPreferredLanguage(string preferredLanguage) { PreferredLanguage = preferredLanguage; }
        public void SetTimeZone(string timezone) { TimeZone = timezone; }
        public void RegisterFailedLogin(int maxFailedAttempts, int lockoutMinutes)
        {
            if (FailedLoginAttempts >= maxFailedAttempts)
            {
                // Reset counter and lock account
                FailedLoginAttempts = 0;
                AccountLockedUntil = TimeZoneHelper.GetLocalTimeNow().AddMinutes(lockoutMinutes);
            }
            else
            {
                // Increase the number of mistakes
                FailedLoginAttempts++;
            }
        }

        public void CreateDoctor(Profile profile, Doctor doctor)
        {
            Profile = profile;
            Doctor = doctor;
        }

        public void CreatePatient(Profile profile, Patient patient)
        {
            Profile = profile;
            Patient = patient;
        }
        #endregion
    }
}
