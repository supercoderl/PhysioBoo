namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserLoggedEvent : DomainEvent
    {
        public Guid UserId { get; }
        public string AccessToken { get; }
        public string RefreshToken { get; }
        public string? UserAgent { get; }
        public string? IpAddress { get; }

        public UserLoggedEvent(Guid userId, string accessToken, string refreshToken, string? userAgent = null, string? ipAddress = null) : base(userId)
        {
            UserId = userId;
            AccessToken = accessToken;
            RefreshToken = refreshToken;
            UserAgent = userAgent;
            IpAddress = ipAddress;
        }
    }
}
