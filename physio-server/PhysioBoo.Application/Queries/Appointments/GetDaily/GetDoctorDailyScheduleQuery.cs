using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;

namespace PhysioBoo.Application.Queries.Appointments.GetDaily
{
    public sealed record GetDoctorDailyScheduleQuery(Guid Id, string Date) : IRequest<List<AppointmentViewModel>>;
}
