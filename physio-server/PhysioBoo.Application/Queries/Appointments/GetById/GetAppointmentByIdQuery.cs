using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;

namespace PhysioBoo.Application.Queries.Appointments.GetById
{
    public sealed record GetAppointmentByIdQuery(Guid Id) : IRequest<AppointmentViewModel?>;
}
