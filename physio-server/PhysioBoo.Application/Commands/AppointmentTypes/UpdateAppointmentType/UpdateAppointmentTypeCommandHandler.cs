using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AppointmentTypes.UpdateAppointmentType
{
    public sealed class UpdateAppointmentTypeCommandHandler : CommandHandlerBase, IRequestHandler<UpdateAppointmentTypeCommand>
    {
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;

        public UpdateAppointmentTypeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentTypeRepository appointmentTypeRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentTypeRepository = appointmentTypeRepository;
        }

        public async Task Handle(UpdateAppointmentTypeCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.AppointmentType? appointmentType = await _appointmentTypeRepository.GetByIdAsync(request.AppointmentType.Id);

            if (appointmentType == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Appointment type with Id {request.AppointmentType.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            appointmentType.SetName(request.AppointmentType.Name);
            appointmentType.SetCode(request.AppointmentType.Code);
            appointmentType.SetDescription(request.AppointmentType.Description);
            appointmentType.SetDefaultDuration(request.AppointmentType.DefaultDuration);
            appointmentType.SetBufferTime(request.AppointmentType.BufferTime);
            appointmentType.SetIsEmergency(request.AppointmentType.IsEmergency);
            appointmentType.SetRequiresPreparation(request.AppointmentType.RequiresPreparation);
            appointmentType.SetPreparationInstructions(request.AppointmentType.PreparationInstructions);
            appointmentType.SetIsFollowUp(request.AppointmentType.IsFollowUp);
            appointmentType.SetConsultationFee(request.AppointmentType.ConsultationFee);
            appointmentType.SetColorCode(request.AppointmentType.ColorCode);
            appointmentType.SetIsActive(request.AppointmentType.IsActive);

            int resultCount = await _appointmentTypeRepository.UpdateTrackedAsync(appointmentType, cancellationToken);
        }
    }
}
