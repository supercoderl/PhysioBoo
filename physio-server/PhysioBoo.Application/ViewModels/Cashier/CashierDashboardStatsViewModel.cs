namespace PhysioBoo.Application.ViewModels.Cashier
{
    public sealed class CashierDashboardStatsViewModel
    {
        public decimal TodayRevenue { get; set; }
        public decimal CashCollected { get; set; }
        public decimal CardPayments { get; set; }
        public decimal InsuranceClaims { get; set; }
        public decimal OutstandingBills { get; set; }
        public decimal RefundAmount { get; set; }
        public int CompletedTransactions { get; set; }
        // No "bill created -> payment received" timestamp delta is tracked anywhere yet — always 0
        // until payment-latency tracking exists (see docs/cashier-redesign.md §12.1).
        public int AveragePaymentTimeSeconds { get; set; }
    }
}
