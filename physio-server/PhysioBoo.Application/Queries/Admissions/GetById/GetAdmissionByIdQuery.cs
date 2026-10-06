using PhysioBoo.Application.ViewModels.Admissions;

namespace PhysioBoo.Application.Queries.Admissions.GetById
{
    public sealed record GetAdmissionByIdQuery(Guid Id) : IRequest<AdmissionViewModel?>;
}
