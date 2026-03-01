using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Suppliers
{
    public sealed class SupplierViewModel
    {
        public Guid Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string? SupplierCode { get; set; }
        public SupplierType Type { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? AlternatePhone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string StateProvince { get; set; } = string.Empty;
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;
        public string? BusinessRegistrationNumber { get; set; }
        public string? TaxIdentificationNumber { get; set; }
        public string? GstNumber { get; set; }
        public string? PanNumber { get; set; }
        public string? DrugLicenseNumber { get; set; }
        public DateOnly? DrugLicenseExpiry { get; set; }
        public string? FdaRegistrationNumber { get; set; }
        public string? IsoCertification { get; set; }
        public bool GmpCertified { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal CreditLimit { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? BankAccountDetails { get; set; }
        public int LeadTimeDays { get; set; }
        public decimal MinimumOrderValue { get; set; }
        public decimal DeliveryReliabilityScore { get; set; }
        public decimal QualityRating { get; set; }
        public decimal ServiceRating { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalPurchaseValue { get; set; }
        public DateOnly? LastOrderDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public static SupplierViewModel FromSupplier(Supplier supplier)
        {
            return new SupplierViewModel
            {
                Id = supplier.Id,
                SupplierName = supplier.SupplierName,
                SupplierCode = supplier.SupplierCode,
                Type = supplier.Type,
                ContactPerson = supplier.ContactPerson,
                Phone = supplier.Phone,
                AlternatePhone = supplier.AlternatePhone,
                Email = supplier.Email,
                Website = supplier.Website,
                Address = supplier.Address,
                City = supplier.City,
                StateProvince = supplier.StateProvince,
                PostalCode = supplier.PostalCode,
                Country = supplier.Country,
                BusinessRegistrationNumber = supplier.BusinessRegistrationNumber,
                TaxIdentificationNumber = supplier.TaxIdentificationNumber,
                GstNumber = supplier.GstNumber,
                PanNumber = supplier.PanNumber,
                DrugLicenseNumber = supplier.DrugLicenseNumber,
                DrugLicenseExpiry = supplier.DrugLicenseExpiry,
                FdaRegistrationNumber = supplier.FdaRegistrationNumber,
                IsoCertification = supplier.IsoCertification,
                GmpCertified = supplier.GmpCertified,
                PaymentTerms = supplier.PaymentTerms,
                CreditLimit = supplier.CreditLimit,
                Currency = supplier.Currency,
                BankAccountDetails = supplier.BankAccountDetails,
                LeadTimeDays = supplier.LeadTimeDays,
                MinimumOrderValue = supplier.MinimumOrderValue,
                DeliveryReliabilityScore = supplier.DeliveryReliabilityScore,
                QualityRating = supplier.QualityRating,
                ServiceRating = supplier.ServiceRating,
                TotalOrders = supplier.TotalOrders,
                TotalPurchaseValue = supplier.TotalPurchaseValue,
                LastOrderDate = supplier.LastOrderDate,
                CreatedAt = supplier.CreatedAt,
                UpdatedAt = supplier.UpdatedAt
            };
        }
    }
}
