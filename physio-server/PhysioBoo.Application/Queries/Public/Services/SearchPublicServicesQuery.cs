using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Public.Services
{
    public sealed record SearchPublicServicesQuery(
        Guid TenantId,
        PagedRequest<PublicServiceFilter> Request
    ) : IRequest<PagedResult<PublicServiceViewModel>>;
}
