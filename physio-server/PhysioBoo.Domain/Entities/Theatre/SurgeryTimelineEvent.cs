namespace PhysioBoo.Domain.Entities.Theatre
{
    // Append-only: one row per stage a case has reached.
    public class SurgeryTimelineEvent : TenantEntity
    {
        #region Core SurgeryTimelineEvent Table (3)
        public Guid SurgeryCaseId { get; private set; }
        public SurgeryTimelineStage Stage { get; private set; }
        public DateTime OccurredAt { get; private set; }

        public virtual SurgeryCase? SurgeryCase { get; private set; }
        #endregion

        #region Constructor (3)
        public SurgeryTimelineEvent(
            Guid id,
            Guid surgeryCaseId,
            SurgeryTimelineStage stage,
            DateTime occurredAt
        ) : base(id)
        {
            SurgeryCaseId = surgeryCaseId;
            Stage = stage;
            OccurredAt = occurredAt;
        }
        #endregion
    }
}
