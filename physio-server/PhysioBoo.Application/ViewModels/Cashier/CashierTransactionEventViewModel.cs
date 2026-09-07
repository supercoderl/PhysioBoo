using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.Cashier
{
    public sealed class CashierTransactionEventViewModel
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = "Payment"; // Payment | Refund | Void | Reprint
        public Guid InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public decimal Amount { get; set; } // negative for refunds
        public string Method { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public string PerformedBy { get; set; } = string.Empty;

        // A Payment row with RefundAmount > 0 renders as TWO timeline entries (original payment +
        // synthetic refund event) rather than two database rows — see docs/cashier-redesign.md §12.0.
        public static List<CashierTransactionEventViewModel> FromPayment(Payment payment)
        {
            List<CashierTransactionEventViewModel> events = new List<CashierTransactionEventViewModel>
            {
                new CashierTransactionEventViewModel
                {
                    Id = payment.Id,
                    Type = "Payment",
                    InvoiceId = payment.BillId,
                    InvoiceNumber = payment.Bill?.BillNumber ?? string.Empty,
                    PatientName = payment.Patient?.Profile?.FullName ?? string.Empty,
                    Amount = payment.Amount,
                    Method = payment.Method.ToString(),
                    OccurredAt = payment.PaymentDate.ToDateTime(payment.PaymentTime),
                    PerformedBy = payment.Processor?.Email ?? string.Empty
                }
            };

            if (payment.RefundAmount > 0 && payment.RefundDate.HasValue)
            {
                events.Add(new CashierTransactionEventViewModel
                {
                    Id = payment.Id, // same underlying row — the frontend distinguishes by Type
                    Type = "Refund",
                    InvoiceId = payment.BillId,
                    InvoiceNumber = payment.Bill?.BillNumber ?? string.Empty,
                    PatientName = payment.Patient?.Profile?.FullName ?? string.Empty,
                    Amount = -payment.RefundAmount,
                    Method = payment.Method.ToString(),
                    OccurredAt = payment.RefundDate.Value,
                    PerformedBy = payment.Processor?.Email ?? string.Empty
                });
            }

            return events;
        }
    }
}
