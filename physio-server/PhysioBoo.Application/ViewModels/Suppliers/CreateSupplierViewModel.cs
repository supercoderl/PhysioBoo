using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Suppliers
{
    public sealed record CreateSupplierViewModel
    (
        Guid Id,
        string SupplierName,
        string? SupplierCode,
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
        string? BusinessRegistrationNumber,
        string? TaxIdentificationNumber,
        string? GstNumber,
        string? PanNumber,
        string? DrugLicenseNumber,
        DateOnly? DrugLicenseExpiry,
        string? FdaRegistrationNumber,
        string? IsoCertification,
        string? PaymentTerms,
        string? BankAccountDetails,
        DateOnly? LastOrderDate
    );
}
