namespace PhysioBoo.Shared.Events.MedicalSpecialties
{
    public sealed class MedicalSpecialtyCreatedEvent : DomainEvent
    {
        public Guid Id { get; }
        public string? IconPublicId { get; }
        public string? IconUrl { get; }

        public MedicalSpecialtyCreatedEvent(Guid id, string? iconPublicId, string? iconUrl) : base(id)
        {
            Id = id;
            IconPublicId = iconPublicId;
            IconUrl = iconUrl;
        }
    }
}
