namespace PhysioBoo.Shared.Events.MedicalSpecialties
{
    public sealed class MedicalSpecialtyDeletedEvent : DomainEvent
    {
        public MedicalSpecialtyDeletedEvent(Guid aggregateId) : base(aggregateId)
        {

        }
    }
}
