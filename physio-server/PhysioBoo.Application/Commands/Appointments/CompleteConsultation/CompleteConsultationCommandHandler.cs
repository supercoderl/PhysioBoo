using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Appointments.CompleteConsultation
{
    public sealed class CompleteConsultationCommandHandler : CommandHandlerBase, IRequestHandler<CompleteConsultationCommand>
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public CompleteConsultationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentRepository appointmentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentRepository = appointmentRepository;
        }

        public async Task Handle(CompleteConsultationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.Appointment? appointment = await _appointmentRepository.GetByIdAsync(request.Id);

            if (appointment == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Appointment not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            appointment.Complete(
                request.Consultation.Diagnosis,
                request.Consultation.TreatmentPlan,
                request.Consultation.FollowUpDate != null ? DateOnly.Parse(request.Consultation.FollowUpDate) : null,
                request.Consultation.DoctorNotes,
                TimeZoneHelper.GetLocalTimeNow()
            );

            appointment.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

            await _appointmentRepository.UpdateTrackedAsync(appointment, ct);
        }
    }
}