using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Payment : Entity
    {
        #region Core Payment Table (23)
        public string PaymentNumber { get; private set; }
        public Guid BillId { get; private set; }
        public Guid PatientId { get; private set; }
        public DateOnly PaymentDate { get; private set; }
        public TimeOnly PaymentTime { get; private set; }
        public decimal Amount { get; private set; }
        public PaymentMethod Method { get; private set; }
        public string? TransactionId { get; private set; }
        public string? ReferenceNumber { get; private set; }
        public string? BankName { get; private set; }
        public string? CashLastFour { get; private set; }
        public string? GatewayResponse { get; private set; } // JSONB
        public PaymentStatus Status { get; private set; }
        public string? FailureReason { get; private set; }
        public Guid? ProcessedBy { get; private set; }
        public bool ReceiptGenerated { get; private set; }
        public string? ReceiptUrl { get; private set; }
        public decimal RefundAmount { get; private set; }
        public DateTime? RefundDate { get; private set; }
        public string? RefundReason { get; private set; }
        public string? Notes { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("BillId")]
        [InverseProperty("Payments")]
        public virtual Bill? Bill { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("Payments")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("ProcessedBy")]
        [InverseProperty("ProcessedPayments")]
        public virtual User? Processor { get; private set; }
        #endregion

        #region Constructor (23)
        public Payment(
            Guid id,
            string paymentNumber,
            Guid billId,
            Guid patientId,
            decimal amount,
            PaymentMethod method,
            string? transactionId,
            string? referenceNumber,
            string? bankName,
            string? cashLastFour,
            string? gatewayResponse,
            string? failureReason,
            Guid? processedBy,
            string? receiptUrl,
            DateTime? refundDate,
            string? refundReason,
            string? notes
        ) : base(id)
        {
            PaymentNumber = paymentNumber;
            BillId = billId;
            PatientId = patientId;
            PaymentDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            PaymentTime = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            Amount = amount;
            Method = method;
            TransactionId = transactionId;
            ReferenceNumber = referenceNumber;
            BankName = bankName;
            CashLastFour = cashLastFour;
            GatewayResponse = gatewayResponse;
            Status = PaymentStatus.Pending;
            FailureReason = failureReason;
            ProcessedBy = processedBy;
            ReceiptGenerated = !string.IsNullOrEmpty(receiptUrl);
            ReceiptUrl = receiptUrl;
            RefundAmount = 0;
            RefundDate = refundDate;
            RefundReason = refundReason;
            Notes = notes;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (23)
        public void SetPaymentNumber(string paymentNumber) { PaymentNumber = paymentNumber; }
        public void SetBillId(Guid billId) { BillId = billId; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetPaymentDate(DateOnly paymentDate) { PaymentDate = paymentDate; }
        public void SetPaymentTime(TimeOnly paymentTime) { PaymentTime = paymentTime; }
        public void SetAmount(decimal amount) { Amount = amount; }
        public void SetMethod(PaymentMethod method) { Method = method; }
        public void SetTransactionId(string? transactionId) { TransactionId = transactionId; }
        public void SetReferenceNumber(string? referenceNumber) { ReferenceNumber = referenceNumber; }
        public void SetBankName(string? bankName) { BankName = bankName; }
        public void SetCashLastFour(string? cashLastFour) { CashLastFour = cashLastFour; }
        public void SetGatewayResponse(string? gatewayResponse) { GatewayResponse = gatewayResponse; }
        public void SetFailureReason(string? failureReason) { FailureReason = failureReason; }
        public void SetProcessedBy(Guid? processedBy) { ProcessedBy = processedBy; }
        public void SetReceiptGenerated(bool receiptGenerated) { ReceiptGenerated = receiptGenerated; }
        public void SetReceiptUrl(string? receiptUrl) { ReceiptUrl = receiptUrl; }
        public void SetRefundAmount(decimal refundAmount) { RefundAmount = refundAmount; }
        public void SetRefundDate(DateTime? refundDate) { RefundDate = refundDate; }
        public void SetRefundReason(string? refundReason) { RefundReason = refundReason; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetStatus(PaymentStatus status) { Status = status; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
