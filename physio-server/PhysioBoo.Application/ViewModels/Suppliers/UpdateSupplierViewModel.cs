using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Suppliers
{
    public sealed record UpdateSupplierViewModel
    (
        string SupplierName,
        SupplierType Type,
        string? ContactPerson,
        string? Phone,
        string? AlternatePhone,
        string? Email,
        string? Website,
        string Address,
        string City,
        string StateProvince,
        string? PostalCode,
        string Country,
        string Currency,
        string? BusinessRegistrationNumber,
        string? TaxIdentificationNumber,
        string? GstNumber,
        string? PanNumber,
        string? DrugLicenseNumber,
        DateOnly? DrugLicenseExpiry,
        string? FdaRegistrationNumber,
        string? IsoCertification,
        bool GmpCertified,
        string? PaymentTerms,
        decimal CreditLimit,
        string? BankAccountDetails,
        int LeadTimeDays,
        decimal MinimumOrderValue,
        decimal DeliveryReliabilityScore,
        decimal QualityRating,
        decimal ServiceRating,
        int TotalOrders,
        decimal TotalPurchaseValue,
        DateOnly? LastOrderDate
    );
}
