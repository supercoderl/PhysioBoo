using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class HospitalGroup : AuditEntity
    {
        #region Core Hospital Group Table (13)
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public string? HeadquartersAddress { get; private set; }
        public string? Website { get; private set; }
        public string? Phone { get; private set; }
        public string? Email { get; private set; }
        public string? LogoUrl { get; private set; }
        public DateTime? EstablishedDate { get; private set; }
        public string? LicenseNumber { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        [Column("AccreditationDetails", TypeName = "jsonb")]
        public string? AccreditationDetails { get; private set; } // JSONB
        public bool IsActive { get; private set; }

        public User? Creator { get; private set; }
        public User? Updater { get; private set; }

        public virtual ICollection<Hospital> Hospitals { get; private set; } = new List<Hospital>();
        public virtual ICollection<Address> Addresses { get; private set; } = new List<Address>();
        public virtual ICollection<Profile> Profiles { get; private set; } = new List<Profile>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();
        public virtual ICollection<Medicine> Medicines { get; private set; } = new List<Medicine>();
        public virtual ICollection<MedicineCategory> MedicineCategories { get; private set; } = new List<MedicineCategory>();
        public virtual ICollection<MedicineInventory> MedicineInventories { get; private set; } = new List<MedicineInventory>();
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        public virtual ICollection<PrescriptionItem> PrescriptionItems { get; private set; } = new List<PrescriptionItem>();
        public virtual ICollection<Role> Roles { get; private set; } = new List<Role>();
        public virtual ICollection<User> Users { get; private set; } = new List<User>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<LabOrderItem> LabOrderItems { get; private set; } = new List<LabOrderItem>();
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();
        public virtual ICollection<Doctor> Doctors { get; private set; } = new List<Doctor>();
        public virtual ICollection<DoctorAward> DoctorAwards { get; private set; } = new List<DoctorAward>();
        public virtual ICollection<DoctorCertification> DoctorCertifications { get; private set; } = new List<DoctorCertification>();
        public virtual ICollection<DoctorEducation> DoctorEducations { get; private set; } = new List<DoctorEducation>();
        public virtual ICollection<DoctorLeave> DoctorLeaves { get; private set; } = new List<DoctorLeave>();
        public virtual ICollection<DoctorPublication> DoctorPublications { get; private set; } = new List<DoctorPublication>();
        public virtual ICollection<DoctorSchedule> DoctorSchedules { get; private set; } = new List<DoctorSchedule>();
        public virtual ICollection<DoctorSpecialty> DoctorSpecialties { get; private set; } = new List<DoctorSpecialty>();
        public virtual ICollection<DoctorWorkExperience> DoctorWorkExperiences { get; private set; } = new List<DoctorWorkExperience>();
        public virtual ICollection<HospitalStaff> HospitalStaffs { get; private set; } = new List<HospitalStaff>();
        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();
        public virtual ICollection<BillItem> BillItems { get; private set; } = new List<BillItem>();
        public virtual ICollection<Department> Departments { get; private set; } = new List<Department>();
        public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();
        public virtual ICollection<Patient> Patients { get; private set; } = new List<Patient>();
        public virtual ICollection<PatientAllergy> PatientAllergies { get; private set; } = new List<PatientAllergy>();
        public virtual ICollection<PatientMedicalHistory> PatientMedicalHistories { get; private set; } = new List<PatientMedicalHistory>();
        public virtual ICollection<Review> Reviews { get; private set; } = new List<Review>();
        #endregion

        #region Constructor (13)
        public HospitalGroup(
            Guid id,
            string name,
            string? description,
            string? headquartersAddress,
            string? website,
            string? phone,
            string? email,
            string? logoUrl,
            DateTime? establishedDate,
            string? licenseNumber,
            string? accreditationDetails
        ) : base(id)
        {
            Name = name;
            Description = description;
            HeadquartersAddress = headquartersAddress;
            Website = website;
            Phone = phone;
            Email = email;
            LogoUrl = logoUrl;
            EstablishedDate = establishedDate;
            LicenseNumber = licenseNumber;
            AccreditationDetails = accreditationDetails;
            IsActive = true; // Default to active
        }
        #endregion

        #region Setter Methods (13)
        public void SetName(string name) { Name = name; }
        public void SetDescription(string? description) { Description = description; }
        public void SetHeadquartersAddress(string? headquartersAddress) { HeadquartersAddress = headquartersAddress; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetLogoUrl(string? logoUrl) { LogoUrl = logoUrl; }
        public void SetEstablishedDate(DateTime? establishedDate) { EstablishedDate = establishedDate; }
        public void SetLicenseNumber(string? licenseNumber) { LicenseNumber = licenseNumber; }
        public void SetAccreditationDetails(string? accreditationDetails) { AccreditationDetails = accreditationDetails; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
