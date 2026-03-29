using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Hospitals
{
    public sealed class HospitalViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? HospitalCode { get; set; }
        public HospitalType HospitalType { get; set; }
        public int BedCapacity { get; set; }
        public int IcuCapacity { get; set; }
        public int EmergencyCapacity { get; set; }
        public int OperationTheaters { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string StateProvince { get; set; } = string.Empty;
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? EmergencyPhone { get; set; }
        public string? AmbulancePhone { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longtitude { get; set; }
        public DateTime? EstablishedDate { get; set; }
        public string? LicenseNumber { get; set; }
        public DateTime? LicenseExpiry { get; set; }
        public string AccreditationBody { get; set; } = string.Empty;
        public DateTime? AccreditationExpiry { get; set; }
        public string[] InsuranceAccepted { get; set; } = Array.Empty<string>();
        public string[] LanguagesSupported { get; set; } = Array.Empty<string>();
        public string? Facilities { get; set; }
        public string? OperatingHours { get; set; }
        public bool Is24Hours { get; set; }
        public bool IsActive { get; set; }
        public string? LogoUrl { get; set; }
        public string? Images { get; set; }
        public string? Description { get; set; }
        public string? MissionStatement { get; set; }
        public string? VisionStatement { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }

        public static HospitalViewModel FromHospital(Hospital hospital)
        {
            return new HospitalViewModel
            {
                Id = hospital.Id,
                Name = hospital.Name,
                HospitalCode = hospital.HospitalCode,
                HospitalType = hospital.HospitalType,
                BedCapacity = hospital.BedCapacity,
                IcuCapacity = hospital.IcuCapacity,
                EmergencyCapacity = hospital.EmergencyCapacity,
                OperationTheaters = hospital.OperationTheaters,
                Address = hospital.Address,
                City = hospital.City,
                StateProvince = hospital.StateProvince,
                PostalCode = hospital.PostalCode,
                Country = hospital.Country,
                Phone = hospital.Phone,
                Fax = hospital.Fax,
                Email = hospital.Email,
                Website = hospital.Website,
                EmergencyPhone = hospital.EmergencyPhone,
                AmbulancePhone = hospital.AmbulancePhone,
                Latitude = hospital.Latitude,
                Longtitude = hospital.Longtitude,
                EstablishedDate = hospital.EstablishedDate,
                LicenseNumber = hospital.LicenseNumber,
                LicenseExpiry = hospital.LicenseExpiry,
                AccreditationBody = hospital.AccreditationBody,
                AccreditationExpiry = hospital.AccreditationExpiry,
                InsuranceAccepted = hospital.InsuranceAccepted?.ToArray() ?? Array.Empty<string>(),
                LanguagesSupported = hospital.LanguagesSupported?.ToArray() ?? Array.Empty<string>(),
                Facilities = hospital.Facilities,
                OperatingHours = hospital.OperatingHours,
                Is24Hours = hospital.Is24Hours,
                IsActive = hospital.IsActive,
                LogoUrl = hospital.LogoUrl,
                Images = hospital.Images,
                Description = hospital.Description,
                MissionStatement = hospital.MissionStatement,
                VisionStatement = hospital.VisionStatement,
                CreatedAt = hospital.CreatedAt,
                CreatedBy = hospital.CreatedBy,
                UpdatedAt = hospital.UpdatedAt,
                UpdatedBy = hospital.UpdatedBy
            };
        }
    }
}
