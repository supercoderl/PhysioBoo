using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Support
{
    public class Supplier : Entity
    {
        #region Core Supplier Table (36)
        public string SupplierName { get; private set; }
        public string? SupplierCode { get; private set; }
        public SupplierType Type { get; private set; }
        public string? ContactPerson { get; private set; }
        public string? Phone { get; private set; }
        public string? AlternatePhone { get; private set; }
        public string? Email { get; private set; }
        public string? Website { get; private set; }
        public string Address { get; private set; }
        public string City { get; private set; }
        public string StateProvince { get; private set; }
        public string? PostalCode { get; private set; }
        public string Country { get; private set; }
        public string? BusinessRegistrationNumber { get; private set; }
        public string? TaxIdentificationNumber { get; private set; }
        public string? GstNumber { get; private set; }
        public string? PanNumber { get; private set; }
        public string? DrugLicenseNumber { get; private set; }
        public DateOnly? DrugLicenseExpiry { get; private set; }
        public string? FdaRegistrationNumber { get; private set; }
        public string? IsoCertification { get; private set; }
        public bool GmpCertified { get; private set; }
        public string? PaymentTerms { get; private set; }
        public decimal CreditLimit { get; private set; }
        public string Currency { get; private set; }
        public string? BankAccountDetails { get; private set; }
        public int LeadTimeDays { get; private set; }
        public decimal MinimumOrderValue { get; private set; }
        public decimal DeliveryReliabilityScore { get; private set; }
        public decimal QualityRating { get; private set; }
        public decimal ServiceRating { get; private set; }
        public int TotalOrders { get; private set; }
        public decimal TotalPurchaseValue { get; private set; }
        public DateOnly? LastOrderDate { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [InverseProperty("Supplier")]
        public virtual ICollection<MedicineInventory> MedicineInventories { get; private set; } = new List<MedicineInventory>();
        #endregion

        #region Constructor (36)
        public Supplier(
            Guid id,
            string supplierName,
            string? supplierCode,
            SupplierType type,
            string? contactPerson,
            string? phone,
            string? alternatePhone,
            string? email,
            string? website,
            string address,
            string city,
            string stateProvince,
            string? postalCode,
            string country,
            string? businessRegistrationNumber,
            string? taxIdentificationNumber,
            string? gstNumber,
            string? panNumber,
            string? drugLicenseNumber,
            DateOnly? drugLicenseExpiry,
            string? fdaRegistrationNumber,
            string? isoCertification,
            string? paymentTerms,
            string? bankAccountDetails,
            DateOnly? lastOrderDate
        ) : base(id)
        {
            SupplierName = supplierName;
            SupplierCode = supplierCode;
            Type = type;
            ContactPerson = contactPerson;
            Phone = phone;
            AlternatePhone = alternatePhone;
            Email = email;
            Website = website;
            Address = address;
            City = city;
            StateProvince = stateProvince;
            PostalCode = postalCode;
            Country = country;
            BusinessRegistrationNumber = businessRegistrationNumber;
            TaxIdentificationNumber = taxIdentificationNumber;
            GstNumber = GstNumber;
            PanNumber = panNumber;
            DrugLicenseNumber = drugLicenseNumber;
            DrugLicenseExpiry = drugLicenseExpiry;
            FdaRegistrationNumber = fdaRegistrationNumber;
            IsoCertification = isoCertification;
            PaymentTerms = paymentTerms;
            BankAccountDetails = bankAccountDetails;
            LastOrderDate = lastOrderDate;
            GmpCertified = false;
            CreditLimit = 0;
            Currency = "USD";
            LeadTimeDays = 7;
            MinimumOrderValue = 0;
            DeliveryReliabilityScore = 0;
            QualityRating = 0;
            ServiceRating = 0;
            TotalOrders = 0;
            TotalPurchaseValue = 0;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (36)
        public void SetSupplierName(string supplierName) { SupplierName = supplierName; }
        public void SetSupplierCode(string? supplierCode) { SupplierCode = supplierCode; }
        public void SetSupplierType(SupplierType supplierType) { Type = supplierType; }
        public void SetContactPerson(string? contactPerson) { ContactPerson = contactPerson; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetAlternatePhone(string? alternatePhone) { AlternatePhone = alternatePhone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetAddress(string address) { Address = address; }
        public void SetCity(string city) { City = city; }
        public void SetStateProvince(string stateProvince) { StateProvince = stateProvince; }
        public void SetPostalCode(string? postalCode) { PostalCode = postalCode; }
        public void SetCountry(string country) { Country = country; }
        public void SetBusinessRegistrationNumber(string? businessRegistrationNumber) { BusinessRegistrationNumber = businessRegistrationNumber; }
        public void SetTaxIdentification(string? taxIdentificationNumber) { TaxIdentificationNumber = taxIdentificationNumber; }
        public void SetGstNumber(string? gstNumber) { GstNumber = gstNumber; }
        public void SetPanNumber(string? panNumber) { PanNumber = panNumber; }
        public void SetDrugLicenseNumber(string? drugLicenseNumber) { DrugLicenseNumber = drugLicenseNumber; }
        public void SetDrugLicenseExpiry(DateOnly? drugLicenseExpiry) { DrugLicenseExpiry = drugLicenseExpiry; }
        public void SetFdaRegistrationNumber(string? fdaRegistrationNumber) { FdaRegistrationNumber = fdaRegistrationNumber; }
        public void SetIsoCertification(string? isoCertification) { IsoCertification = isoCertification; }
        public void SetGmpCertified(bool gmpCertified) { GmpCertified = gmpCertified; }
        public void SetPaymentTerms(string? paymentTerms) { PaymentTerms = paymentTerms; }
        public void SetCreditLimit(decimal creditLimit) { CreditLimit = creditLimit; }
        public void SetCurrency(string currency) { Currency = currency; }
        public void SetBankAccountDetails(string? bankAccountDetails) { BankAccountDetails = bankAccountDetails; }
        public void SetLeadTimeDays(int leadTimeDays) { LeadTimeDays = leadTimeDays; }
        public void SetMinimumOrderValue(decimal minimumOrderValue) { MinimumOrderValue = minimumOrderValue; }
        public void SetDeliveryReliabilityScore(decimal deliveryReliabilityScore) { DeliveryReliabilityScore = deliveryReliabilityScore; }
        public void SetQuantityRating(decimal quantityRating) { QualityRating = quantityRating; }
        public void SetServiceRating(decimal serviceRating) { ServiceRating = serviceRating; }
        public void SetTotalOrders(int totalOrders) { TotalOrders = totalOrders; }
        public void SetTotalPurchaseValue(decimal totalPurchaseValue) { TotalPurchaseValue = totalPurchaseValue; }
        public void SetLastOrderDated(DateOnly? lastOrderDate) { LastOrderDate = lastOrderDate; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
