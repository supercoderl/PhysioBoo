namespace PhysioBoo.Shared.Events.RefreshTokens
{
    public sealed class RefreshTokenCreatedEvent : DomainEvent
    {
        public List<Guid> Ids;

        public RefreshTokenCreatedEvent(List<Guid> ids) : base(Guid.NewGuid())
        {
            Ids = ids;
        }
    }
}
