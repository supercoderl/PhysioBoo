namespace PhysioBoo.Shared.Events.Patients
{
    public sealed class PatientCreatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public PatientCreatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
