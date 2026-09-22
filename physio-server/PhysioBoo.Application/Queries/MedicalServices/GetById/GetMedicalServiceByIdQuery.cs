using PhysioBoo.Application.ViewModels.MedicalServices;

namespace PhysioBoo.Application.Queries.MedicalServices.GetById
{
    public sealed record GetMedicalServiceByIdQuery(Guid Id) : IRequest<MedicalServiceViewModel?>;
}
