using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Doctors.GetAll
{
    public sealed record GetAllDoctorsQuery(
           PagedRequest<DoctorFilter> Request
       ) : IRequest<PagedResult<DoctorViewModel>>;
}
