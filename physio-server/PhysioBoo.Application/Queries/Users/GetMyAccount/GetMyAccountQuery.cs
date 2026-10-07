using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Queries.Users.GetMyAccount
{
    public sealed record GetMyAccountQuery() : IRequest<MyAccountViewModel?>;
}
