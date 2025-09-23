namespace PhysioBoo.Shared.Events.Hospitals
{
    public sealed class HospitalCreatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public HospitalCreatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
