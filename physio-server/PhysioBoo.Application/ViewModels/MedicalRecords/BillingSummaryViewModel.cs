using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class BillingSummaryViewModel
    {
        public sealed class BillRow
        {
            public Guid Id { get; set; }
            public string BillNumber { get; set; } = string.Empty;
            public string BillDate { get; set; } = string.Empty;
            public BillType Type { get; set; }
            public decimal TotalAmount { get; set; }
            public decimal PaidAmount { get; set; }
            public decimal OutstandingAmount { get; set; }
            public PaymentStatus PaymentStatus { get; set; }
            public string? DueDate { get; set; }
            public string Currency { get; set; } = string.Empty;
            public string? AppointmentNumber { get; set; }
            public string? InsuranceClaimNumber { get; set; }
            public decimal InsurancePaidAmount { get; set; }
            public decimal PatientCopayAmount { get; set; }

            public static BillRow FromBill(Bill bill)
            {
                return new BillRow
                {
                    Id = bill.Id,
                    BillNumber = bill.BillNumber,
                    BillDate = TimeZoneHelper.ConvertDateTimeToString(bill.BillDate, DateFormats.IsoDate),
                    Type = bill.Type,
                    TotalAmount = bill.TotalAmount,
                    PaidAmount = bill.PaidAmount,
                    OutstandingAmount = bill.OutstandingAmount,
                    PaymentStatus = bill.PaymentStatus,
                    DueDate = TimeZoneHelper.ConvertDateTimeToString(bill.DueDate, DateFormats.IsoDate),
                    Currency = bill.Currency,
                    AppointmentNumber = bill.Appointment?.AppointmentNumber,
                    InsuranceClaimNumber = bill.InsuranceClaimNumber,
                    InsurancePaidAmount = bill.InsurancePaidAmount,
                    PatientCopayAmount = bill.PatientCopayAmount
                };
            }
        }

        public sealed class PaymentRow
        {
            public Guid Id { get; set; }
            public string PaymentNumber { get; set; } = string.Empty;
            public string BillNumber { get; set; } = string.Empty;
            public string PaymentDate { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public PaymentMethod Method { get; set; }
            public PaymentStatus Status { get; set; }
            public string? TransactionId { get; set; }
            public string? ReceiptUrl { get; set; }

            public static PaymentRow FromPayment(Payment payment)
            {
                return new PaymentRow
                {
                    Id = payment.Id,
                    PaymentNumber = payment.PaymentNumber,
                    BillNumber = payment.Bill?.BillNumber ?? string.Empty,
                    PaymentDate = TimeZoneHelper.ConvertDateTimeToString(payment.PaymentDate, DateFormats.IsoDate),
                    Amount = payment.Amount,
                    Method = payment.Method,
                    Status = payment.Status,
                    TransactionId = payment.TransactionId,
                    ReceiptUrl = payment.ReceiptUrl
                };
            }
        }

        public string Currency { get; set; } = string.Empty;
        public decimal TotalCharges { get; set; }
        public decimal TotalPayments { get; set; }
        public decimal InsurancePaid { get; set; }
        public decimal OutstandingBalance { get; set; }
        public IReadOnlyList<BillRow> Bills { get; set; } = Array.Empty<BillRow>();
        public IReadOnlyList<PaymentRow> RecentPayments { get; set; } = Array.Empty<PaymentRow>();

        public static BillingSummaryViewModel FromEntity(
            string currency,
            decimal totalCharges,
            decimal totalPayments,
            decimal insurancePaid,
            decimal outstandingBalance,
            IReadOnlyList<BillRow> bills,
            IReadOnlyList<PaymentRow> recentPayments
        )
        {
            return new BillingSummaryViewModel
            {
                Currency = currency,
                TotalCharges = totalCharges,
                TotalPayments = totalPayments,
                InsurancePaid = insurancePaid,
                OutstandingBalance = outstandingBalance,
                Bills = bills,
                RecentPayments = recentPayments
            };
        }
    }
}
