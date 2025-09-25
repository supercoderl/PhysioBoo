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

        public CreateAppointmentTypeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentTypeRepository appointmentTypeRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentTypeRepository = appointmentTypeRepository;
        }

        public async Task Handle(CreateAppointmentTypeCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _appointmentTypeRepository.InsertAsync<AppointmentType, Guid>(new AppointmentType(
                request.NewAppointmentType.Id,
                request.NewAppointmentType.Name,
                request.NewAppointmentType.Code,
                request.NewAppointmentType.Description,
                request.NewAppointmentType.PreparationInstructions,
                request.NewAppointmentType.ColorCode
            ));

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
