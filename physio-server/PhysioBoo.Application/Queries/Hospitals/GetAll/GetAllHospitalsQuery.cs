using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Hospitals.GetAll
{
    public sealed record GetAllHospitalsQuery(
        PagedRequest<HospitalFilter> Request
    ) : IRequest<PagedResult<HospitalViewModel>>;
}
