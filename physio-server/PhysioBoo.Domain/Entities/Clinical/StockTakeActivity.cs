using PhysioBoo.Domain.Entities.Core;




namespace PhysioBoo.Domain.Entities.Clinical
{
    public class StockTakeActivity : TenantEntity
    {
        #region Core Stock Take Activity Table (4)
        // Append-only audit trail scoped to the stock-take workflow — separate from StockMovement,
        // which tracks quantity changes, not workflow events.
        public Guid StockTakeId { get; private set; }
        public StockTakeActivityType Type { get; private set; }
        public string Message { get; private set; }
        public Guid Actor { get; private set; }
        public DateTime OccurredAt { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? ActorUser { get; private set; }
        public virtual StockTake? StockTake { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (4)
        public StockTakeActivity(
            Guid id,
            Guid stockTakeId,
            StockTakeActivityType type,
            string message,
            Guid actor
        ) : base(id)
        {
            StockTakeId = stockTakeId;
            Type = type;
            Message = message;
            Actor = actor;
            OccurredAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion
    }
}
