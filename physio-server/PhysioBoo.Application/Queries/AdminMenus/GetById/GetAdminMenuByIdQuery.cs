using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;

namespace PhysioBoo.Application.Queries.AdminMenus.GetById
{
    public sealed record GetAdminMenuByIdQuery(Guid Id) : IRequest<AdminMenuViewModel?>;
}
