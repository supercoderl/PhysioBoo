namespace PhysioBoo.Shared.Events.RefreshTokens
{
    public sealed class RefreshTokenCreatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public RefreshTokenCreatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
