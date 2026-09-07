using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Extensions
{
    // Central place that actually calls Bill.UpdateAmounts() — before this, the method existed on
    // the entity but nothing in the codebase ever invoked it (see docs/cashier-redesign.md §2,
    // Problem #2). Every mutation that changes a Bill's items, discount, insurance coverage, or
    // payments must go through here so PaidAmount/OutstandingAmount/PaymentStatus never drift from
    // the underlying BillItems/Payments rows. Requires bill.BillItems and bill.Payments to be loaded
    // (via includeProperties) before calling.
    public static class BillExtensions
    {
        public static void RecalculateAndApply(
            this Bill bill,
            decimal? discountAmount = null,
            decimal? insuranceApprovedAmount = null,
            decimal? insurancePaidAmount = null,
            decimal? patientCopayAmount = null)
        {
            decimal subtotal = bill.BillItems.Sum(i => i.UnitPrice * i.Quantity);
            decimal taxAmount = bill.BillItems.Sum(i => i.TaxAmount);
            decimal discount = discountAmount ?? bill.DiscountAmount;
            decimal insuranceApproved = insuranceApprovedAmount ?? bill.InsuranceApprovedAmount;
            decimal insurancePaid = insurancePaidAmount ?? bill.InsurancePaidAmount;
            decimal copay = patientCopayAmount ?? bill.PatientCopayAmount;

            decimal total = Math.Max(0, subtotal + taxAmount - discount - insurancePaid);
            decimal paid = bill.Payments
                .Where(p => p.Status == PaymentStatus.Paid)
                .Sum(p => p.Amount - p.RefundAmount);
            decimal outstanding = Math.Max(0, total - paid);

            bill.UpdateAmounts(subtotal, taxAmount, discount, total, paid, outstanding, insuranceApproved, insurancePaid, copay);

            if (bill.PaymentStatus != PaymentStatus.Cancelled)
            {
                PaymentStatus status = outstanding <= 0 && total > 0
                    ? PaymentStatus.Paid
                    : paid > 0
                        ? PaymentStatus.Partial
                        : PaymentStatus.Pending;

                bill.SetPaymentStatus(status);
            }
        }
    }
}
