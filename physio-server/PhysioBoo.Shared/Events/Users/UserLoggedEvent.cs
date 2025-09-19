namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserLoggedEvent : DomainEvent
    {
        public Guid UserId { get; }
        public string AccessToken { get; }
        public string RefreshToken { get; }

        public UserLoggedEvent(Guid userId, string accessToken, string refreshToken) : base(userId)
        {
            UserId = userId;
            AccessToken = accessToken;
            RefreshToken = refreshToken;
        }
    }
}
