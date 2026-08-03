using MediatR;
using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Queries.AdminMenus.GetMine
{
    public sealed record GetMyMenusQuery() : IRequest<List<UserMenuViewModel>>;
}