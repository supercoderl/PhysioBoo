namespace PhysioBoo.Application.Commands.Sessions.RevokeOtherSessions
{
    public sealed class RevokeOtherSessionsCommand : CommandBase, IRequest
    {
        /// <summary>The caller's refresh_token cookie; that session is kept.</summary>
        public string? CurrentRefreshToken { get; }

        public RevokeOtherSessionsCommand(string? currentRefreshToken) : base(Guid.NewGuid())
        {
            CurrentRefreshToken = currentRefreshToken;
        }

        public override bool IsValid() => true;
    }
}
