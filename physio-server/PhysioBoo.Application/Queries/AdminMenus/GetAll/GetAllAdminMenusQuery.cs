using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AdminMenus.GetAll
{
    public sealed record GetAllAdminMenusQuery(
        PagedRequest<AdminMenuFilter> Request
    ) : IRequest<PagedResult<AdminMenuViewModel>>;
}
