namespace PhysioBoo.Shared.Events.MedicalSpecialties
{
    public sealed class MedicalSpecialtyUpdatedEvent : DomainEvent
    {
        public Guid Id { get; }
        public string? IconPublicId { get; }
        public string? NewIconUrl { get; }
        public string? OldIconUrl { get; }

        public MedicalSpecialtyUpdatedEvent(Guid id, string? iconPublicId, string? newIconUrl, string? oldIconUrl) : base(id)
        {
            Id = id;
            IconPublicId = iconPublicId;
            NewIconUrl = newIconUrl;
            OldIconUrl = oldIconUrl;
        }
    }
}
