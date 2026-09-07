using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailTransactionLineItemViewModel
    {
        public Guid Id { get; set; }
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal InsuranceCoveredAmount { get; set; }
        public decimal Total { get; set; }
    }

    public sealed class RetailPaymentSplitViewModel
    {
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public sealed class RetailTransactionViewModel
    {
        public Guid Id { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public string CashierName { get; set; } = string.Empty;
        public RetailCustomerViewModel? Customer { get; set; }
        public List<RetailTransactionLineItemViewModel> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal DiscountTotal { get; set; }
        public decimal InsuranceCoverage { get; set; }
        public decimal Vat { get; set; }
        public decimal GrandTotal { get; set; }
        public List<RetailPaymentSplitViewModel> PaymentSplits { get; set; } = new();
        public decimal AmountTendered { get; set; }
        public decimal ChangeDue { get; set; }
        public DateTime CompletedAt { get; set; }
        public string Status { get; set; } = "Completed"; // Completed | Refunded | Suspended

        public static RetailTransactionViewModel FromRetailTransaction(RetailTransaction t)
        {
            return new RetailTransactionViewModel
            {
                Id = t.Id,
                TransactionNumber = t.TransactionNumber,
                CashierName = t.Cashier?.Email ?? string.Empty,
                Customer = t.CustomerType == null ? null : new RetailCustomerViewModel
                {
                    Type = t.CustomerType.Value.ToString(),
                    PatientId = t.CustomerPatientId,
                    FullName = t.CustomerFullName ?? string.Empty,
                    Phone = t.CustomerPhone ?? string.Empty,
                    Mrn = t.CustomerMrn,
                    InsuranceProvider = t.CustomerInsuranceProvider
                },
                Items = t.RetailTransactionLineItems.Select(i => new RetailTransactionLineItemViewModel
                {
                    Id = i.Id,
                    MedicineId = i.MedicineId,
                    Name = i.MedicineNameSnapshot,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPriceSnapshot,
                    DiscountPercent = i.DiscountPercent,
                    InsuranceCoveredAmount = i.InsuranceCoveredAmount,
                    Total = i.Total
                }).ToList(),
                Subtotal = t.Subtotal,
                DiscountTotal = t.DiscountTotal,
                InsuranceCoverage = t.InsuranceCoverage,
                Vat = t.Vat,
                GrandTotal = t.GrandTotal,
                PaymentSplits = t.RetailPaymentSplits.Select(p => new RetailPaymentSplitViewModel
                {
                    Method = p.Method.ToString(),
                    Amount = p.Amount
                }).ToList(),
                AmountTendered = t.AmountTendered,
                ChangeDue = t.ChangeDue,
                CompletedAt = t.CompletedAt,
                Status = t.Status.ToString()
            };
        }
    }
}
