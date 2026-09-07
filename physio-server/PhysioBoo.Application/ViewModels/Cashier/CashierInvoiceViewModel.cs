using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.Cashier
{
    public sealed class CashierChargeLineViewModel
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty; // ItemType as string
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsInsuranceCovered { get; set; }

        public static CashierChargeLineViewModel FromBillItem(BillItem item)
        {
            return new CashierChargeLineViewModel
            {
                Id = item.Id,
                Category = item.Type.ToString(),
                Name = item.ItemName ?? string.Empty,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountAmount = item.DiscountAmount,
                TaxAmount = item.TaxAmount,
                TotalAmount = item.TotalAmount,
                IsInsuranceCovered = item.IsInsuranceCovered
            };
        }
    }

    public sealed class CashierInvoiceViewModel
    {
        public Guid Id { get; set; }
        public string BillNumber { get; set; } = string.Empty;
        public DateOnly BillDate { get; set; }
        public string VisitType { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;

        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientMrn { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;

        public List<CashierChargeLineViewModel> Charges { get; set; } = new();

        public decimal Subtotal { get; set; }
        public decimal TaxRate { get; set; } // derived: TaxAmount / Subtotal, informational
        public decimal TaxAmount { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal InsuranceCoverageAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingBalance { get; set; }

        public string Status { get; set; } = "Pending";

        public static CashierInvoiceViewModel FromBill(Bill bill)
        {
            decimal taxRate = bill.Subtotal > 0 ? Math.Round(100m * bill.TaxAmount / bill.Subtotal, 2) : 0;
            decimal discountPercent = bill.Subtotal > 0 ? Math.Round(100m * bill.DiscountAmount / bill.Subtotal, 2) : 0;

            return new CashierInvoiceViewModel
            {
                Id = bill.Id,
                BillNumber = bill.BillNumber,
                BillDate = bill.BillDate,
                VisitType = bill.Appointment?.ConsultationType.ToString() ?? bill.Source.ToString(),
                DepartmentName = bill.Department?.Name ?? string.Empty,
                DoctorName = bill.Appointment?.Doctor?.User?.Profile?.FullName ?? string.Empty,
                PatientId = bill.PatientId,
                PatientName = bill.Patient?.Profile?.FullName ?? string.Empty,
                PatientMrn = bill.Patient?.PatientNumber ?? string.Empty,
                PatientPhone = bill.Patient?.Profile?.Phone ?? string.Empty,
                Charges = bill.BillItems.Select(i => CashierChargeLineViewModel.FromBillItem(i)).ToList(),
                Subtotal = bill.Subtotal,
                TaxRate = taxRate,
                TaxAmount = bill.TaxAmount,
                DiscountPercent = discountPercent,
                DiscountAmount = bill.DiscountAmount,
                InsuranceCoverageAmount = bill.InsurancePaidAmount,
                TotalAmount = bill.TotalAmount,
                PaidAmount = bill.PaidAmount,
                RemainingBalance = bill.OutstandingAmount,
                Status = bill.PaymentStatus.ToString()
            };
        }
    }
}
