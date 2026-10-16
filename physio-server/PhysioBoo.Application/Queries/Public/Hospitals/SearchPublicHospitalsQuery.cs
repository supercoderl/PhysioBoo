using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Public.Hospitals
{
    public sealed record SearchPublicHospitalsQuery(
        Guid TenantId,
        PagedRequest<PublicHospitalFilter> Request
    ) : IRequest<PagedResult<PublicHospitalViewModel>>;
}
