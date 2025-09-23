namespace PhysioBoo.Shared.Events.HospitalGroups
{
    public sealed class HospitalGroupCreatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public HospitalGroupCreatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
