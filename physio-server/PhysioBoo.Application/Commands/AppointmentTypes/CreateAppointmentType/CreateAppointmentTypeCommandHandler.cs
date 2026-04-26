using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommandHandler : CommandHandlerBase, IRequestHandler<CreateAppointmentTypeCommand>
    {
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateAppointmentTypeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentTypeRepository appointmentTypeRepository,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentTypeRepository = appointmentTypeRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateAppointmentTypeCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(AppointmentType), cancellationToken);

            AppointmentType newAppointmentType = new AppointmentType(
                request.NewId,
                request.NewAppointmentType.Name,
                newCode,
                request.NewAppointmentType.Description,
                request.NewAppointmentType.PreparationInstructions,
                request.NewAppointmentType.ColorCode
            );

            newAppointmentType.SetDefaultDuration(request.NewAppointmentType.DefaultDuration);
            newAppointmentType.SetBufferTime(request.NewAppointmentType.BufferTime);
            newAppointmentType.SetConsultationFee(request.NewAppointmentType.ConsultationFee);
            newAppointmentType.SetIsEmergency(request.NewAppointmentType.IsEmergency);
            newAppointmentType.SetRequiresPreparation(request.NewAppointmentType.RequiresPreparation);
            newAppointmentType.SetIsFollowUp(request.NewAppointmentType.IsFollowUp);

            SharedKernel.Results.DbResult<Guid> result = await _appointmentTypeRepository.InsertAsync<AppointmentType, Guid>(newAppointmentType);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try gain. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
