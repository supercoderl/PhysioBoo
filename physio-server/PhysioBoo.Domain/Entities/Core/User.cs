using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class User : Entity
    {
        #region Core User Table (21)
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public string? AlternatePhone { get; private set; }
        public string PasswordHash { get; private set; }
        public Role Role { get; private set; }
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
        public DateTime CreatedAt { get; private set; }
        public Guid? CreatedBy { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedUsers")]
        public virtual User? Creator { get; private set; }

        [ForeignKey("UpdatedBy")]
        [InverseProperty("UpdatedUsers")]
        public virtual User? Updater { get; private set; }

        [InverseProperty("Creator")]
        public virtual ICollection<User> CreatedUsers { get; private set; } = new List<User>();

        [InverseProperty("Updater")]
        public virtual ICollection<User> UpdatedUsers { get; private set; } = new List<User>();

        [InverseProperty("User")]
        public virtual ICollection<Address> Addresses { get; private set; } = new List<Address>();

        [InverseProperty("CancelledByUser")]
        public virtual ICollection<Appointment> CancelledAppointments { get; private set; } = new List<Appointment>();

        [InverseProperty("CreatedByUser")]
        public virtual ICollection<Appointment> CreatedAppointments { get; private set; } = new List<Appointment>();

        [InverseProperty("Creator")]
        public virtual ICollection<Bill> CreatedBills { get; private set; } = new List<Bill>();

        [InverseProperty("Approver")]
        public virtual ICollection<Bill> ApprovedBills { get; private set; } = new List<Bill>();

        [InverseProperty("PerformedByUser")]
        public virtual ICollection<BillItem> PerformedBillItems { get; private set; } = new List<BillItem>();

        [InverseProperty("HeadOfDeptUser")]
        public virtual ICollection<Department> HeadedDepartments { get; private set; } = new List<Department>();

        [InverseProperty("VerifiedByUser")]
        public virtual ICollection<Doctor> VerifiedDoctors { get; private set; } = new List<Doctor>();

        [InverseProperty("Approver")]
        public virtual ICollection<DoctorLeave> ApprovedLeaves { get; private set; } = new List<DoctorLeave>();

        [InverseProperty("Manager")]
        public virtual ICollection<HospitalStaff> HospitalStaffs { get; private set; } = new List<HospitalStaff>();

        [InverseProperty("Technician")]
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();

        [InverseProperty("Radiologist")]
        public virtual ICollection<ImagingOrder> RadiologistImagingOrders { get; private set; } = new List<ImagingOrder>();

        [InverseProperty("Creator")]
        public virtual ICollection<ImagingOrder> CreatedImagingOrders { get; private set; } = new List<ImagingOrder>();

        [InverseProperty("Radiologist")]
        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();

        [InverseProperty("Creator")]
        public virtual ICollection<LabOrder> CreatedLabOrders { get; private set; } = new List<LabOrder>();

        [InverseProperty("SampleCollector")]
        public virtual ICollection<LabOrderItem> CollectedLabSamples { get; private set; } = new List<LabOrderItem>();

        [InverseProperty("Technician")]
        public virtual ICollection<LabOrderItem> ProcessedLabTests { get; private set; } = new List<LabOrderItem>();

        [InverseProperty("Verifier")]
        public virtual ICollection<LabOrderItem> VerifiedLabTests { get; private set; } = new List<LabOrderItem>();

        [InverseProperty("Pathologist")]
        public virtual ICollection<LabReport> PathologistLabReports { get; private set; } = new List<LabReport>();

        [InverseProperty("Creator")]
        public virtual ICollection<MedicalRecord> CreatedMedicalRecords { get; private set; } = new HashSet<MedicalRecord>();

        [InverseProperty("Processor")]
        public virtual ICollection<Payment> ProcessedPayments { get; private set; } = new List<Payment>();

        [InverseProperty("Reviewer")]
        public virtual ICollection<Review> Reviews { get; private set; } = new List<Review>();

        [InverseProperty("Moderator")]
        public virtual ICollection<Review> ModeratedReviews { get; private set; } = new List<Review>();

        [InverseProperty("Responder")]
        public virtual ICollection<Review> Responses { get; private set; } = new List<Review>();

        [InverseProperty("User")]
        public virtual ICollection<VerificationToken> VerificationTokens { get; private set; } = new List<VerificationToken>();

        [InverseProperty("User")]
        public virtual ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

        #endregion

        #region Constructor (21)
        public User(
            Guid id,
            string email,
            string phone,
            string passwordHash,
            Role role,
            Guid? createdBy
        ) : base(id)
        {
            Email = email;
            Phone = phone;
            AlternatePhone = null;
            PasswordHash = passwordHash;
            Role = role;
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
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            CreatedBy = createdBy;
            UpdatedAt = null;
            UpdatedBy = null;
        }
        #endregion

        #region Setter Methods (21)
        public void SetEmail(string email) { Email = email; }
        public void SetPhone(string phone) { Phone = phone; }
        public void SetAlternatePhone(string? alternatePhone) { AlternatePhone = alternatePhone; }
        public void SetPassword(string passwordHash) { PasswordHash = passwordHash; }
        public void SetRole(Role role) { Role = role; }
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
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetCreatedBy(Guid? createdBy) { CreatedBy = createdBy; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        public void SetUpdatedBy(Guid? updatedBy) { UpdatedBy = updatedBy; }
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
        #endregion
    }
}
