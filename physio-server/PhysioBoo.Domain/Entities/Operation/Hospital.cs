using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using Column = System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;

namespace PhysioBoo.Domain.Entities.Operation
{
    [PlaceholderGroup("Hospital", "hospital", Order = 3)]
    public class Hospital : TenantEntity
    {
        #region Core Hospital Table (39)
        [Placeholder(Label = "Hospital Name", Example = "Sunrise International Hospital")]
        public string Name { get; private set; }

        [Placeholder(Label = "Hospital Code", Example = "HSP-SIH-2026")]
        public string? HospitalCode { get; private set; }

        [Placeholder(Label = "Hospital Type", Example = "General")]
        public HospitalType HospitalType { get; private set; }

        [Placeholder(Label = "Bed Capacity", Example = "500")]
        public int BedCapacity { get; private set; }

        [Placeholder(Label = "ICU Capacity", Example = "50")]
        public int IcuCapacity { get; private set; }

        [Placeholder(Label = "Emergency Capacity", Example = "120")]
        public int EmergencyCapacity { get; private set; }

        [Placeholder(Label = "Operation Theaters", Example = "12")]
        public int OperationTheaters { get; private set; }

        [Placeholder(Label = "Address", Example = "123 Nguyen Hue Boulevard")]
        public string Address { get; private set; }

        [Placeholder(Label = "City", Example = "Ho Chi Minh City")]
        public string City { get; private set; }

        [Placeholder(Label = "State / Province", Example = "Ho Chi Minh")]
        public string StateProvince { get; private set; }

        [Placeholder(Label = "Postal Code", Example = "700000")]
        public string? PostalCode { get; private set; }

        [Placeholder(Label = "Country", Example = "Vietnam")]
        public string Country { get; private set; }

        [Placeholder(Label = "Phone", Example = "+84 28 3822 9999")]
        public string? Phone { get; private set; }

        [Placeholder(Label = "Fax", Example = "+84 28 3822 8888")]
        public string? Fax { get; private set; }

        [Placeholder(Label = "Email", Example = "contact@sunrisehospital.vn")]
        public string? Email { get; private set; }

        [Placeholder(Label = "Website", Example = "https://www.sunrisehospital.vn")]
        public string? Website { get; private set; }

        [Placeholder(Label = "Emergency Phone", Example = "+84 28 115")]
        public string? EmergencyPhone { get; private set; }

        [Placeholder(Label = "Ambulance Phone", Example = "+84 28 1022")]
        public string? AmbulancePhone { get; private set; }

        [Placeholder(Label = "Latitude", Example = "10.7769")]
        public decimal? Latitude { get; private set; }

        [Placeholder(Label = "Longitude", Example = "106.7009")]
        public decimal? Longtitude { get; private set; }

        [Placeholder(Label = "Established Date", Example = "2005-08-15 00:00:00")]
        public DateTime? EstablishedDate { get; private set; }

        [Placeholder(Label = "License Number", Example = "VN-HOSP-2026-9981")]
        public string? LicenseNumber { get; private set; }

        [Placeholder(Label = "License Expiry", Example = "2030-12-31 00:00:00")]
        public DateTime? LicenseExpiry { get; private set; }

        [Placeholder(Label = "Accreditation Body", Example = "Joint Commission International (JCI)")]
        public string AccreditationBody { get; private set; }

        [Placeholder(Label = "Accreditation Expiry", Example = "2029-06-30 00:00:00")]
        public DateTime? AccreditationExpiry { get; private set; }

        [Placeholder(Label = "Insurance Accepted", Example = "AIA, Bao Viet, Prudential")]
        public string[] InsuranceAccepted { get; private set; }

        [Placeholder(Label = "Languages Supported", Example = "Vietnamese, English, French")]
        public string[] LanguagesSupported { get; private set; }

        [Placeholder(
            Label = "Facilities",
            Example = "{\"pharmacy\":true,\"laboratory\":true,\"parking\":true,\"cafeteria\":true}"
        )]
        [Column("Facilities", TypeName = "jsonb")]
        public string? Facilities { get; private set; } // JSONB

        [Placeholder(
            Label = "Operating Hours",
            Example = "{\"monday\":\"08:00-17:00\",\"tuesday\":\"08:00-17:00\",\"sunday\":\"Closed\"}"
        )]
        [Column("OperatingHours", TypeName = "jsonb")]
        public string? OperatingHours { get; private set; } // JSONB

        [Placeholder(Label = "Open 24 Hours", Example = "true")]
        public bool Is24Hours { get; private set; }

        [Placeholder(Label = "Is Active", Example = "true")]
        public bool IsActive { get; private set; }

        [Placeholder(Label = "Logo URL", Example = "https://cdn.hospital.vn/logo.png")]
        public string? LogoUrl { get; private set; }

        [Placeholder(
            Label = "Images",
            Example = "[\"https://cdn.hospital.vn/image1.jpg\",\"https://cdn.hospital.vn/image2.jpg\"]"
        )]
        [Column("Images", TypeName = "jsonb")]
        public string? Images { get; private set; } // JSONB

        [Placeholder(
            Label = "Description",
            Example = "A multi-specialty hospital providing advanced healthcare services and emergency care."
        )]
        public string? Description { get; private set; }

        [Placeholder(
            Label = "Mission Statement",
            Example = "To deliver compassionate, affordable, and high-quality healthcare services."
        )]
        public string? MissionStatement { get; private set; }

        [Placeholder(
            Label = "Vision Statement",
            Example = "To become the leading smart healthcare institution in Southeast Asia."
        )]
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
        public virtual ICollection<Room> Rooms { get; private set; } = new List<Room>();
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
