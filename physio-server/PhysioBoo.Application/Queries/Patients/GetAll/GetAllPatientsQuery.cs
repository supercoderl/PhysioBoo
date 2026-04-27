using MediatR;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Patients.GetAll
{
    public sealed record GetAllPatientsQuery(
        PagedRequest<PatientFilter> Request
    ) : IRequest<PagedResult<PatientViewModel>>;
}
