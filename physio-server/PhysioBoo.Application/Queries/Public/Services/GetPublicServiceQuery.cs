using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Queries.Public.Services
{
    /// <summary>Null when the service is unknown, unpublished, archived, deleted, at a hidden clinic or of another tenant.</summary>
    public sealed record GetPublicServiceQuery(Guid TenantId, Guid ServiceId) : IRequest<PublicServiceDetailViewModel?>;
}
