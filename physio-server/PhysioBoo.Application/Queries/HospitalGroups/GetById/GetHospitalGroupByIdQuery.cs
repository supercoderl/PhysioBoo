using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;

namespace PhysioBoo.Application.Queries.HospitalGroups.GetById
{
    public sealed record GetHospitalGroupByIdQuery(Guid Id) : IRequest<HospitalGroupViewModel?>;
}
