using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Entities.Finance;

namespace PhysioBoo.Application.ViewModels.InsuranceClaims
{
    public class InsuranceClaimCardViewModel
    {
        public Guid Id { get; set; }
        public string ClaimNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientId { get; set; } = string.Empty;
        public string Mrn { get; set; } = string.Empty;
        public Guid ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public decimal ClaimAmount { get; set; }
        public string Hospital { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? SubmissionDate { get; set; }
        public string CurrentStage { get; set; } = string.Empty;
        public int ProgressPercent { get; set; }
        public string Status { get; set; } = string.Empty;
        public int MissingDocumentsCount { get; set; }
        public int RiskScore { get; set; }
        public double? ApprovalVelocityDays { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Expects InsuranceCompany, Patient and Documents to be loaded.
        /// </summary>
        public static InsuranceClaimCardViewModel FromEntity(InsuranceClaim claim)
        {
            InsuranceClaimCardViewModel vm = new InsuranceClaimCardViewModel();
            vm.Fill(claim);
            return vm;
        }

        protected void Fill(InsuranceClaim claim)
        {
            InsuranceClaimStage stage = claim.GetStage();

            Id = claim.Id;
            ClaimNumber = claim.ClaimNumber;
            PatientName = claim.PatientName;
            PatientId = claim.PatientId?.ToString() ?? string.Empty;
            Mrn = claim.Patient?.PatientNumber ?? string.Empty;
            ProviderId = claim.InsuranceCompanyId;
            ProviderName = claim.InsuranceCompany?.Name ?? string.Empty;
            ClaimAmount = claim.ClaimAmount;
            Hospital = claim.Hospital ?? string.Empty;
            Department = claim.Department ?? string.Empty;
            DoctorName = claim.DoctorName ?? string.Empty;
            Priority = claim.Priority.ToString();
            SubmissionDate = claim.SubmittedAt;
            CurrentStage = stage.ToString();
            ProgressPercent = CalculateProgress(claim.Status, stage);
            Status = claim.Status.ToString();
            MissingDocumentsCount = claim.MissingRequiredDocumentsCount();
            RiskScore = CalculateRiskScore(claim);
            ApprovalVelocityDays = CalculateApprovalVelocityDays(claim);
            UpdatedAt = claim.UpdatedAt ?? claim.CreatedAt;
        }

        public static int CalculateProgress(InsuranceClaimStatus status, InsuranceClaimStage stage)
        {
            if (status == InsuranceClaimStatus.Settled) return 100;

            int stageCount = Enum.GetValues<InsuranceClaimStage>().Length;
            return Math.Min(95, (int)Math.Round(((int)stage + 1) * 100.0 / stageCount));
        }

        /// <summary>
        /// Heuristic 0-100 score: missing paperwork, near-limit amounts, negative outcomes
        /// and claims stuck with the insurer all raise the risk.
        /// </summary>
        public static int CalculateRiskScore(InsuranceClaim claim)
        {
            int score = claim.MissingRequiredDocumentsCount() * 15;

            score += claim.Priority switch
            {
                InsuranceClaimPriority.Urgent => 10,
                InsuranceClaimPriority.High => 5,
                _ => 0
            };

            decimal? maxCoverage = claim.InsuranceCompany?.MaximumCoverageAmount;
            if (maxCoverage is > 0 && claim.ClaimAmount > maxCoverage.Value * 0.8m)
                score += 25;

            if (claim.Status is InsuranceClaimStatus.Rejected or InsuranceClaimStatus.NeedCorrection)
                score += 20;

            if (claim.SubmittedAt.HasValue && claim.DecidedAt == null && (DateTime.UtcNow - claim.SubmittedAt.Value).TotalDays > 30)
                score += 15;

            return Math.Clamp(score, 0, 100);
        }

        public static double? CalculateApprovalVelocityDays(InsuranceClaim claim)
        {
            if (!claim.SubmittedAt.HasValue || !claim.DecidedAt.HasValue) return null;
            return Math.Round((claim.DecidedAt.Value - claim.SubmittedAt.Value).TotalDays, 1);
        }
    }
}
