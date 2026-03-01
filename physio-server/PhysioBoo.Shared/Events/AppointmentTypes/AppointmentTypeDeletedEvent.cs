namespace PhysioBoo.Shared.Events.AppointmentTypes
{
    public sealed class AppointmentTypeDeletedEvent : DomainEvent
    {
        public AppointmentTypeDeletedEvent(Guid id) : base(id)
        {

        }
    }
}
