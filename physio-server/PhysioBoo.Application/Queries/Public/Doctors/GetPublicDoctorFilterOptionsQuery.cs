using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    public sealed record GetPublicDoctorFilterOptionsQuery(Guid TenantId) : IRequest<PublicDoctorFilterOptionsViewModel>;
}
