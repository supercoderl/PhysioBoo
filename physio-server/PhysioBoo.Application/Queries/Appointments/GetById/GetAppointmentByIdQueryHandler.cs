using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Appointments.GetById
{
    public sealed class GetAppointmentByIdQueryHandler : IRequestHandler<GetAppointmentByIdQuery, AppointmentViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IAppointmentRepository _appointmentRepository;

        public GetAppointmentByIdQueryHandler(
            IMediatorHandler bus,
            IAppointmentRepository appointmentRepository
        )
        {
            _bus = bus;
            _appointmentRepository = appointmentRepository;
        }

        public async Task<AppointmentViewModel?> Handle(GetAppointmentByIdQuery request, CancellationToken ct)
        {
            Appointment? appointment = await _appointmentRepository.GetByIdAsync(request.Id, ct: ct);

            if (appointment == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAppointmentByIdQuery),
                    $"Appointment with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return AppointmentViewModel.FromEntity(appointment);
        }
    }
}
