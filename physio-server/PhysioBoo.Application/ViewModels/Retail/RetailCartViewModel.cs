using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailCartViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = "Active"; // Active | Held
        public RetailCustomerViewModel? Customer { get; set; }
        public List<RetailCartLineItemViewModel> Items { get; set; } = new();
        public DateTime CreatedAt { get; set; }

        public static RetailCartViewModel FromRetailCart(RetailCart cart)
        {
            return new RetailCartViewModel
            {
                Id = cart.Id,
                Name = cart.Name,
                Status = cart.Status.ToString(),
                CreatedAt = cart.CreatedAt,
                Customer = cart.CustomerType == null ? null : new RetailCustomerViewModel
                {
                    Type = cart.CustomerType.Value.ToString(),
                    PatientId = cart.CustomerPatientId,
                    FullName = cart.CustomerFullName ?? string.Empty,
                    Phone = cart.CustomerPhone ?? string.Empty,
                    Mrn = cart.CustomerMrn,
                    InsuranceProvider = cart.CustomerInsuranceProvider,
                    InsuranceCoverageAmount = cart.CustomerInsuranceCoverageAmount,
                    LoyaltyPoints = cart.CustomerLoyaltyPoints,
                    PrescriptionReference = cart.CustomerPrescriptionReference,
                    AllergyInformation = cart.CustomerAllergyInformation
                },
                Items = cart.RetailCartLineItems.Select(i => new RetailCartLineItemViewModel
                {
                    Id = i.Id,
                    MedicineId = i.MedicineId,
                    Name = i.Medicine?.Name ?? string.Empty,
                    GenericName = i.Medicine?.GenericName,
                    Strength = i.Medicine?.Strength,
                    Unit = i.Medicine?.DosageForm.ToString() ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    DiscountPercent = i.DiscountPercent,
                    InsuranceCoveredAmount = i.InsuranceCoveredAmount,
                    Total = i.Total()
                }).ToList()
            };
        }
    }
}
