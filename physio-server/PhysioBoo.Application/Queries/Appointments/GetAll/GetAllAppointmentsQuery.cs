using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Appointments.GetAll
{
    public sealed record GetAllAppointmentsQuery(
        PagedRequest<AppointmentFilter> Request
    ) : IRequest<PagedResult<AppointmentViewModel>>;
}
