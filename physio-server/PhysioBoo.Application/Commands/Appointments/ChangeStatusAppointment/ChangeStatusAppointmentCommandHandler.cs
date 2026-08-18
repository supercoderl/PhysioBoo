using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Appointments.ChangeStatusAppointment
{
    public sealed class ChangeStatusAppointmentCommandHandler : CommandHandlerBase, IRequestHandler<ChangeStatusAppointmentCommand>
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public ChangeStatusAppointmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentRepository appointmentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentRepository = appointmentRepository;
        }

        public async Task Handle(ChangeStatusAppointmentCommand request, CancellationToken ct)
        {
            Domain.Entities.Operation.Appointment? appointment = await _appointmentRepository.GetByIdAsync(request.Id);
            if (appointment == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Appointment not found.",
                    ErrorCodes.ObjectNotFound));
                return;
            }

            appointment.SetAppointmentStatus(request.Appointment.Status);

            await _appointmentRepository.UpdateTrackedAsync(appointment, ct);
        }
    }
}