using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetById
{
    public sealed record GetMedicalSpecialtyByIdQuery(Guid Id) : IRequest<MedicalSpecialtyViewModel?>;
}
