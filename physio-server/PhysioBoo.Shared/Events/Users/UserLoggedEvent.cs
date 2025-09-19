namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserLoggedEvent : DomainEvent
    {
        public string AccessToken { get; }
        public string RefreshToken { get; }

        public UserLoggedEvent(Guid id, string accessToken, string refreshToken) : base(id)
        {
            AccessToken = accessToken;
            RefreshToken = refreshToken;
        }
    }
}
