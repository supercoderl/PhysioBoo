namespace PhysioBoo.Application.ViewModels.RevenueReports
{
    public sealed class RevenueSummaryViewModel
    {
        public decimal TotalRevenue { get; set; }
        public double TotalRevenueGrowthPct { get; set; }
        public decimal NetRevenue { get; set; }
        public int TotalPatients { get; set; }
        public int TotalTransactions { get; set; }
        public decimal AverageBillValue { get; set; }
        public decimal OutstandingRevenue { get; set; }
        public int OutstandingCount { get; set; }
        public decimal TotalRefunds { get; set; }
        public int RefundCount { get; set; }
        public decimal TotalDiscounts { get; set; }
        public int DiscountCount { get; set; }
        public decimal InsuranceRevenue { get; set; }
        public List<decimal> RevenueTrend { get; set; } = new();
    }

    public sealed class RevenueTrendPointViewModel
    {
        public string Label { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public decimal CashPayments { get; set; }
        public decimal CardPayments { get; set; }
        public decimal InsurancePayments { get; set; }
        public decimal UpiPayments { get; set; }
        public decimal OtherPayments { get; set; }
        public decimal Total { get; set; }
    }

    public sealed class PaymentMethodBreakdownViewModel
    {
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public sealed class DepartmentRevenuePerformanceViewModel
    {
        public Guid DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Patients { get; set; }
        public int Transactions { get; set; }
        public double Percentage { get; set; }
        public double GrowthPct { get; set; }
    }

    public sealed class DoctorRevenuePerformanceViewModel
    {
        public Guid DoctorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Patients { get; set; }
        public int Transactions { get; set; }
        public decimal AverageBillValue { get; set; }
        public double GrowthPct { get; set; }
    }

    public sealed class InsuranceProviderRevenueViewModel
    {
        public Guid ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public decimal ClaimedAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal RejectedAmount { get; set; }
        public int ClaimCount { get; set; }
        public double ApprovalRatePct { get; set; }
    }

    public sealed class OutstandingAgingSummaryViewModel
    {
        public string Bucket { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    public sealed class OutstandingInvoiceViewModel
    {
        public Guid InvoiceId { get; set; }
        public string BillNo { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateOnly? DueDate { get; set; }
        public decimal AmountDue { get; set; }
        public string AgingBucket { get; set; } = string.Empty;
        public int DaysOverdue { get; set; }
    }

    public sealed class RefundRecordViewModel
    {
        public Guid RefundId { get; set; }
        public string BillNo { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string ProcessedBy { get; set; } = string.Empty;
    }

    public sealed class DiscountRecordViewModel
    {
        public Guid DiscountId { get; set; }
        public string BillNo { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ApprovedBy { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
    }

    public class RevenueTransactionViewModel
    {
        public Guid Id { get; set; }
        public string BillNo { get; set; } = string.Empty;
        public DateTime Datetime { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Discount { get; set; }
        public decimal Refund { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public sealed class RevenueTransactionDetailViewModel : RevenueTransactionViewModel
    {
        public List<RevenueTransactionLineItemViewModel> LineItems { get; set; } = new();
        public List<RevenueTransactionPaymentSplitViewModel> PaymentSplits { get; set; } = new();
        public RevenueTransactionInsuranceClaimViewModel? InsuranceClaim { get; set; }
        public string? Notes { get; set; }
    }

    public sealed class RevenueTransactionLineItemViewModel
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public sealed class RevenueTransactionPaymentSplitViewModel
    {
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Reference { get; set; }
    }

    public sealed class RevenueTransactionInsuranceClaimViewModel
    {
        public string ProviderName { get; set; } = string.Empty;
        public decimal ClaimedAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public sealed class RevenueReportExportFile
    {
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
}
