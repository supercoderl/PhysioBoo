namespace PhysioBoo.Shared.Events.Doctors
{
    public sealed class DoctorCreatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public DoctorCreatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
