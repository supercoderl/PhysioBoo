namespace PhysioBoo.Application.ViewModels.InsuranceClaims
{
    public sealed class InsuranceClaimStatsViewModel
    {
        public int TotalClaims { get; set; }
        public int PendingClaims { get; set; }
        public int ApprovedClaims { get; set; }
        public int RejectedClaims { get; set; }
        public int AppealedClaims { get; set; }
        public decimal TotalClaimAmount { get; set; }
        public decimal TotalApprovedAmount { get; set; }
        public double AvgApprovalVelocityDays { get; set; }
        public int MissingDocumentsCount { get; set; }
        public double RiskScoreAvg { get; set; }
        public int ClaimHealthScore { get; set; }
        public List<double> ApprovalVelocityTrend { get; set; } = new();
    }

    public sealed class InsuranceProviderNodeViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ClaimCount { get; set; }
        public int PendingCount { get; set; }
    }
}
