using PhysioBoo.Application.Commands.Conversations;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Presentation.Filters
{
    // Staff-only workspace features with no permission code of their own (scrumboard, academy learning).
    // `RequireAuthorization()` alone admits any signed-in user, including a PATIENT account created inside the
    // tenant, so this applies the same "team member" rule as the team chat (ConversationAccess.IsTeamMember):
    // an active user holding a role other than PATIENT or SUPER_ADMIN. Everyone else gets 403.
    public sealed class TeamMemberFilter : IEndpointFilter
    {
        private readonly IUser _user;
        private readonly IUserRepository _userRepository;

        public TeamMemberFilter(IUser user, IUserRepository userRepository)
        {
            _user = user;
            _userRepository = userRepository;
        }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            CancellationToken ct = context.HttpContext.RequestAborted;

            if (!await ConversationAccess.IsTeamMemberAsync(_userRepository, _user.GetUserId(), ct))
            {
                return Results.Json(new ResponseMessage<object>
                {
                    Success = false,
                    Errors = new[] { "This feature is only available to clinic staff." }
                }, statusCode: StatusCodes.Status403Forbidden);
            }

            return await next(context);
        }
    }
}
