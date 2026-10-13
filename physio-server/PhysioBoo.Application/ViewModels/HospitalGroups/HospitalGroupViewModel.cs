using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    public sealed class HospitalGroupViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? ContactPerson { get; set; }
        public string? HeadquartersAddress { get; set; }
        public Guid? CountryId { get; set; }
        public Guid? CityId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? WardId { get; set; }
        public string? Website { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime? EstablishedDate { get; set; }
        public string? LicenseNumber { get; set; }
        public string? AccreditationDetails { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>Filled by the list query only (one grouped count and one subscription lookup per page).</summary>
        public int HospitalCount { get; set; }
        public string? SubscriptionPlan { get; set; }

        public static HospitalGroupViewModel FromHospitalGroup(HospitalGroup hospitalGroup)
        {
            return new HospitalGroupViewModel
            {
                Id = hospitalGroup.Id,
                Name = hospitalGroup.Name,
                Code = hospitalGroup.Code,
                Description = hospitalGroup.Description,
                ContactPerson = hospitalGroup.ContactPerson,
                HeadquartersAddress = hospitalGroup.HeadquartersAddress,
                CountryId = hospitalGroup.CountryId,
                CityId = hospitalGroup.CityId,
                DistrictId = hospitalGroup.DistrictId,
                WardId = hospitalGroup.WardId,
                Website = hospitalGroup.Website,
                Phone = hospitalGroup.Phone,
                Email = hospitalGroup.Email,
                LogoUrl = hospitalGroup.LogoUrl,
                EstablishedDate = hospitalGroup.EstablishedDate,
                LicenseNumber = hospitalGroup.LicenseNumber,
                AccreditationDetails = hospitalGroup.AccreditationDetails,
                IsActive = hospitalGroup.IsActive,
                CreatedAt = hospitalGroup.CreatedAt
            };
        }
    }
}
