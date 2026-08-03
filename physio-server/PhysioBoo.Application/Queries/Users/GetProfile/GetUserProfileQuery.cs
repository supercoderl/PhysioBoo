using MediatR;
using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Queries.Users.GetProfile
{
    public sealed record GetUserProfileQuery() : IRequest<UserProfileSummaryViewModel?>;
}
