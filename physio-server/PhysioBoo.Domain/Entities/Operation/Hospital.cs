using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Hospital : TenantEntity
    {
        #region Core Hospital Table (39)
        public string Name { get; private set; }
        public string? HospitalCode { get; private set; }
        public HospitalType HospitalType { get; private set; }
        public int BedCapacity { get; private set; }
        public int IcuCapacity { get; private set; }
        public int EmergencyCapacity { get; private set; }
        public int OperationTheaters { get; private set; }
        public string Address { get; private set; }
        public string City { get; private set; }
        public string StateProvince { get; private set; }
        public string? PostalCode { get; private set; }
        public string Country { get; private set; }
        public string? Phone { get; private set; }
        public string? Fax { get; private set; }
        public string? Email { get; private set; }
        public string? Website { get; private set; }
        public string? EmergencyPhone { get; private set; }
        public string? AmbulancePhone { get; private set; }
        public decimal? Latitude { get; private set; }
        public decimal? Longtitude { get; private set; }
        public DateTime? EstablishedDate { get; private set; }
        public string? LicenseNumber { get; private set; }
        public DateTime? LicenseExpiry { get; private set; }
        public string AccreditationBody { get; private set; }
        public DateTime? AccreditationExpiry { get; private set; }
        public string[] InsuranceAccepted { get; private set; }
        public string[] LanguagesSupported { get; private set; }

        [Column("Facilities", TypeName = "jsonb")]
        public string? Facilities { get; private set; } // JSONB

        [Column("OperatingHours", TypeName = "jsonb")]
        public string? OperatingHours { get; private set; } // JSONB
        public bool Is24Hours { get; private set; }
        public bool IsActive { get; private set; }
        public string? LogoUrl { get; private set; }

        [Column("Images", TypeName = "jsonb")]
        public string? Images { get; private set; } // JSONB
        public string? Description { get; private set; }
        public string? MissionStatement { get; private set; }
        public string? VisionStatement { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();
        public virtual ICollection<Department> Departments { get; private set; } = new List<Department>();
        public virtual ICollection<DoctorSchedule> DoctorSchedules { get; private set; } = new List<DoctorSchedule>();
        public virtual ICollection<HospitalStaff> HospitalStaffs { get; private set; } = new List<HospitalStaff>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();
        public virtual ICollection<MedicineInventory> MedicineInventories { get; private set; } = new List<MedicineInventory>();
        public virtual ICollection<Patient> ReferredPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<Patient> PreferredPatients { get; private set; } = new List<Patient>();
        public virtual ICollection<PatientMedicalHistory> PatientMedicalHistories { get; private set; } = new List<PatientMedicalHistory>();
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        #endregion

        #region Constructor (41)
        public Hospital(
            Guid id,
            string name,
            string? hospitalCode,
            HospitalType hospitalType,
            int emergencyCapacity,
            int operationTheaters,
            string address,
            string city,
            string stateProvince,
            string? postalCode,
            string country,
            string? phone,
            string? fax,
            string? email,
            string? website,
            string? emergencyPhone,
            string? ambulancePhone,
            decimal? latitude,
            decimal? longtitude,
            DateTime? establishedDate,
            string? licenseNumber,
            DateTime? licenseExpiry,
            string accreditationBody,
            DateTime? accreditationExpiry,
            string[] insuranceAccepted,
            string[] languagesSupported,
            string? facilities,
            string? operatingHours,
            string? logoUrl,
            string? images,
            string? description,
            string? missionStatement,
            string? visionStatement
        ) : base(id)
        {
            Name = name;
            HospitalCode = hospitalCode;
            HospitalType = hospitalType;
            BedCapacity = 0; // Default to 0, can be updated later
            IcuCapacity = 0; // Default to 0, can be updated later
            EmergencyCapacity = emergencyCapacity;
            OperationTheaters = operationTheaters;
            Address = address;
            City = city;
            StateProvince = stateProvince;
            PostalCode = postalCode;
            Country = country;
            Phone = phone;
            Fax = fax;
            Email = email;
            Website = website;
            EmergencyPhone = emergencyPhone;
            AmbulancePhone = ambulancePhone;
            Latitude = latitude;
            Longtitude = longtitude;
            EstablishedDate = establishedDate;
            LicenseNumber = licenseNumber;
            LicenseExpiry = licenseExpiry;
            AccreditationBody = accreditationBody;
            AccreditationExpiry = accreditationExpiry;
            InsuranceAccepted = insuranceAccepted;
            LanguagesSupported = languagesSupported;
            Facilities = facilities;
            OperatingHours = operatingHours;
            Is24Hours = false; // Default to false, can be updated later
            IsActive = true; // Default to active
            LogoUrl = logoUrl;
            Images = images;
            Description = description;
            MissionStatement = missionStatement;
            VisionStatement = visionStatement;
        }
        #endregion

        #region Setter Methods (39)
        public void SetName(string name) { Name = name; }
        public void SetHospitalCode(string? hospitalCode) { HospitalCode = hospitalCode; }
        public void SetHospitalType(HospitalType hospitalType) { HospitalType = hospitalType; }
        public void SetBedCapacity(int bedCapacity) { BedCapacity = bedCapacity; }
        public void SetIcuCapacity(int icuCapacity) { IcuCapacity = icuCapacity; }
        public void SetEmergencyCapacity(int emergencyCapacity) { EmergencyCapacity = emergencyCapacity; }
        public void SetOperationTheaters(int operationTheaters) { OperationTheaters = operationTheaters; }
        public void SetAddress(string address) { Address = address; }
        public void SetCity(string city) { City = city; }
        public void SetStateProvince(string stateProvince) { StateProvince = stateProvince; }
        public void SetPostalCode(string? postalCode) { PostalCode = postalCode; }
        public void SetCountry(string country) { Country = country; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetFax(string? fax) { Fax = fax; }
        public void SetEmail(string? email) { Email = email; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetEmergencyPhone(string? emergencyPhone) { EmergencyPhone = emergencyPhone; }
        public void SetAmbulancePhone(string? ambulancePhone) { AmbulancePhone = ambulancePhone; }
        public void SetLatitude(decimal? latitude) { Latitude = latitude; }
        public void SetLongtitude(decimal? longtitude) { Longtitude = longtitude; }
        public void SetEstablishedDate(DateTime? establishedDate) { EstablishedDate = establishedDate; }
        public void SetLicenseNumber(string? licenseNumber) { LicenseNumber = licenseNumber; }
        public void SetLicenseExpiry(DateTime? licenseExpiry) { LicenseExpiry = licenseExpiry; }
        public void SetAccreditationBody(string accreditationBody) { AccreditationBody = accreditationBody; }
        public void SetAccreditationExpiry(DateTime? accreditationExpiry) { AccreditationExpiry = accreditationExpiry; }
        public void SetInsuranceAccepted(string[] insuranceAccepted) { InsuranceAccepted = insuranceAccepted; }
        public void SetLanguagesSupported(string[] languagesSupported) { LanguagesSupported = languagesSupported; }
        public void SetFacilities(string? facilities) { Facilities = facilities; }
        public void SetOperatingHours(string? operatingHours) { OperatingHours = operatingHours; }
        public void SetIs24Hours(bool is24Hours) { Is24Hours = is24Hours; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetLogoUrl(string? logoUrl) { LogoUrl = logoUrl; }
        public void SetImages(string? images) { Images = images; }
        public void SetDescription(string? description) { Description = description; }
        public void SetMissionStatement(string? missionStatement) { MissionStatement = missionStatement; }
        public void SetVisionStatement(string? visionStatement) { VisionStatement = visionStatement; }
        #endregion
    }
}
