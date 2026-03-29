using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    public sealed class HospitalGroupViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? HeadquartersAddress { get; set; }
        public string? Website { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime? EstablishedDate { get; set; }
        public string? LicenseNumber { get; set; }
        public string? AccreditationDetails { get; set; }
        public bool IsActive { get; set; }

        public static HospitalGroupViewModel FromHospitalGroup(HospitalGroup hospitalGroup)
        {
            return new HospitalGroupViewModel
            {
                Id = hospitalGroup.Id,
                Name = hospitalGroup.Name,
                Description = hospitalGroup.Description,
                HeadquartersAddress = hospitalGroup.HeadquartersAddress,
                Website = hospitalGroup.Website,
                Phone = hospitalGroup.Phone,
                Email = hospitalGroup.Email,
                LogoUrl = hospitalGroup.LogoUrl,
                EstablishedDate = hospitalGroup.EstablishedDate,
                LicenseNumber = hospitalGroup.LicenseNumber,
                AccreditationDetails = hospitalGroup.AccreditationDetails,
                IsActive = hospitalGroup.IsActive
            };
        }
    }
}
