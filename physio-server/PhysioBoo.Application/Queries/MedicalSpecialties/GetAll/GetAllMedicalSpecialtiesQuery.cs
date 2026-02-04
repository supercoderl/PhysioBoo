using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetAll
{
    public sealed record GetAllMedicalSpecialtiesQuery(
        PagedRequest<MedicalSpecialtyFilter> Request
    ) : IRequest<PagedResult<MedicalSpecialtyViewModel>>;
}
