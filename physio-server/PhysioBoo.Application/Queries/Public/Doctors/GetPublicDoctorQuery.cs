using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    /// <summary>Null when the doctor is unknown, belongs to another tenant or is not publicly listed.</summary>
    public sealed record GetPublicDoctorQuery(Guid TenantId, Guid DoctorId) : IRequest<PublicDoctorDetailViewModel?>;

    public sealed record GetRelatedPublicDoctorsQuery(Guid TenantId, Guid DoctorId) : IRequest<List<PublicDoctorViewModel>>;
}
