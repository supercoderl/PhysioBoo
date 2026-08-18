using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Appointments.GetDaily
{
    public sealed class GetDoctorDailyScheduleQueryHandler : IRequestHandler<GetDoctorDailyScheduleQuery, List<AppointmentViewModel>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMediatorHandler _bus;

        public GetDoctorDailyScheduleQueryHandler(
            IAppointmentRepository appointmentRepository,
            IMediatorHandler bus
        )
        {
            _appointmentRepository = appointmentRepository;
            _bus = bus;
        }

        public async Task<List<AppointmentViewModel>> Handle(GetDoctorDailyScheduleQuery q, CancellationToken ct)
        {
            if (!DateOnly.TryParse(q.Date, out DateOnly parsedDate))
            {
                await _bus.RaiseEventAsync(
                    new DomainNotification(
                        nameof(GetDoctorDailyScheduleQuery),
                        "Invalid date format.",
                        ErrorCodes.InvalidValue));

                return [];
            }

            AppointmentsSearchSpec spec = new AppointmentsSearchSpec(q.Id, parsedDate);

            List<Appointment> appointments = await _appointmentRepository.ListAsync(spec, ct);

            // Map to view model
            return appointments.Select(AppointmentViewModel.FromEntity).ToList();
        }
    }
}
