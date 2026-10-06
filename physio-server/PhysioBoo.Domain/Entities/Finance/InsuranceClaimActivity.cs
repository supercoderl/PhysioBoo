namespace PhysioBoo.Domain.Entities.Finance
{
    /// <summary>
    /// One row per timeline event, note, insurer message or audit entry of a claim.
    /// </summary>
    public class InsuranceClaimActivity : TenantEntity
    {
        #region Core Insurance Claim Activity Table (8)
        public Guid ClaimId { get; private set; }
        public InsuranceClaimActivityKind Kind { get; private set; }
        public string? EventType { get; private set; }
        public string? Direction { get; private set; }
        public string Actor { get; private set; }
        public string? Message { get; private set; }
        public string? Details { get; private set; }
        public DateTime OccurredAt { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual InsuranceClaim? Claim { get; private set; }
        #endregion

        #region Constructor (8)
        public InsuranceClaimActivity(
            Guid id,
            Guid claimId,
            InsuranceClaimActivityKind kind,
            string? eventType,
            string? direction,
            string actor,
            string? message,
            string? details,
            DateTime occurredAt
        ) : base(id)
        {
            ClaimId = claimId;
            Kind = kind;
            EventType = eventType;
            Direction = direction;
            Actor = actor;
            Message = message;
            Details = details;
            OccurredAt = occurredAt;
        }
        #endregion
    }
}
