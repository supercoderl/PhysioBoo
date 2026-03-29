using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;

namespace PhysioBoo.Application.Queries.Hospitals.GetById
{
    public sealed record GetHospitalByIdQuery(Guid Id) : IRequest<HospitalViewModel?>;
}
