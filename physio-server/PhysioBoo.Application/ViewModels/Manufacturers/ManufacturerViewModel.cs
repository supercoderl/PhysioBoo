using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Application.ViewModels.Manufacturers
{
    public sealed class ManufacturerViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CompanyCode { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LicenseNumber { get; set; }
        public bool GmpCertified { get; set; }
        public bool IsoCertified { get; set; }
        public bool FdaApproved { get; set; }
        public int EstablishedYear { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static ManufacturerViewModel FromManufacturer(Manufacturer manufacturer)
        {
            return new ManufacturerViewModel
            {
                Id = manufacturer.Id,
                Name = manufacturer.Name,
                CompanyCode = manufacturer.CompanyCode,
                Address = manufacturer.Address,
                City = manufacturer.City,
                State = manufacturer.State,
                Country = manufacturer.Country,
                PostalCode = manufacturer.PostalCode,
                Phone = manufacturer.Phone,
                Email = manufacturer.Email,
                Website = manufacturer.Website,
                LicenseNumber = manufacturer.LicenseNumber,
                GmpCertified = manufacturer.GmpCertified,
                IsoCertified = manufacturer.IsoCertified,
                FdaApproved = manufacturer.FdaApproved,
                EstablishedYear = manufacturer.EstablishedYear,
                IsActive = manufacturer.IsActive,
                CreatedAt = manufacturer.CreatedAt
            };
        }
    }
}
