using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Queries.Public.Hospitals
{
    /// <summary>Null when the clinic is unknown, inactive, deleted or belongs to another tenant.</summary>
    public sealed record GetPublicHospitalQuery(Guid TenantId, Guid HospitalId) : IRequest<PublicHospitalDetailViewModel?>;
}
