using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Queries.Public.Services
{
    public sealed record GetPublicServiceFilterOptionsQuery(Guid TenantId) : IRequest<PublicServiceFilterOptionsViewModel>;
}
