using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;

namespace PhysioBoo.Application.Queries.Doctors.GetById
{
    public sealed record GetDoctorByIdQuery(Guid Id) : IRequest<DoctorViewModel?>;
}
