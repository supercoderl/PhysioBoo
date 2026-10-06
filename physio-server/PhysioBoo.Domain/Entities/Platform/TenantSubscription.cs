namespace PhysioBoo.Domain.Entities.Platform
{
    /// <summary>
    /// A tenant's (hospital group's) current plan and billing period. One row per tenant.
    /// </summary>
    public class TenantSubscription : AuditEntity
    {
        public const int TrialDays = 14;

        #region Core Tenant Subscription Table (10)
        public Guid HospitalGroupId { get; private set; }
        public Guid PlanId { get; private set; }
        public SubscriptionStatus Status { get; private set; }
        public DateTime StartedAt { get; private set; }
        public DateTime CurrentPeriodStart { get; private set; }
        public DateTime CurrentPeriodEnd { get; private set; }
        public DateTime? TrialEndsAt { get; private set; }
        public DateTime? CancelledAt { get; private set; }
        public string? BillingEmail { get; private set; }
        public string? Notes { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        public virtual SubscriptionPlan? Plan { get; private set; }
        public virtual ICollection<SubscriptionInvoice> Invoices { get; private set; } = new List<SubscriptionInvoice>();
        #endregion

        #region Constructor (5)
        public TenantSubscription(
            Guid id,
            Guid hospitalGroupId,
            Guid planId,
            SubscriptionStatus status,
            DateTime startedAt
        ) : base(id)
        {
            HospitalGroupId = hospitalGroupId;
            PlanId = planId;
            Status = status;
            StartedAt = startedAt;
            CurrentPeriodStart = startedAt;

            if (status == SubscriptionStatus.Trial)
            {
                TrialEndsAt = startedAt.AddDays(TrialDays);
                CurrentPeriodEnd = TrialEndsAt.Value;
            }
            else
            {
                CurrentPeriodEnd = startedAt.AddMonths(1);
            }
        }

        public static TenantSubscription StartTrial(Guid id, Guid hospitalGroupId, Guid planId, DateTime now) =>
            new TenantSubscription(id, hospitalGroupId, planId, SubscriptionStatus.Trial, now);
        #endregion

        #region Methods
        public void SetBillingEmail(string? billingEmail) { BillingEmail = billingEmail; }
        public void SetNotes(string? notes) { Notes = notes; }

        /// <summary>
        /// Switching plans takes effect immediately; the current period is kept.
        /// </summary>
        public void ChangePlan(Guid planId) { PlanId = planId; }

        public void Activate(DateTime now)
        {
            // Leaving a trial (or a cancellation) starts a fresh monthly period.
            if (Status is SubscriptionStatus.Trial or SubscriptionStatus.Cancelled)
            {
                CurrentPeriodStart = now;
                CurrentPeriodEnd = now.AddMonths(1);
            }

            Status = SubscriptionStatus.Active;
            CancelledAt = null;
        }

        public void MarkPastDue() { Status = SubscriptionStatus.PastDue; }

        public void Cancel(DateTime now)
        {
            Status = SubscriptionStatus.Cancelled;
            CancelledAt = now;
        }

        /// <summary>
        /// Rolls the billing period forward month by month until it contains <paramref name="now"/>.
        /// </summary>
        public void RollPeriodTo(DateTime now)
        {
            while (CurrentPeriodEnd <= now)
            {
                CurrentPeriodStart = CurrentPeriodEnd;
                CurrentPeriodEnd = CurrentPeriodEnd.AddMonths(1);
            }
        }
        #endregion
    }
}
