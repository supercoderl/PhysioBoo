using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    public sealed record SearchPublicDoctorsQuery(
        Guid TenantId,
        PagedRequest<PublicDoctorFilter> Request
    ) : IRequest<PagedResult<PublicDoctorViewModel>>;
}
