using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.AppointmentTypes;

namespace PhysioBoo.Application.Commands.AppointmentTypes.DeleteAppointmentType
{
    public sealed class DeleteAppointmentTypeCommandHandler : CommandHandlerBase, IRequestHandler<DeleteAppointmentTypeCommand>
    {
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;

        public DeleteAppointmentTypeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentTypeRepository appointmentTypeRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentTypeRepository = appointmentTypeRepository;
        }

        public async Task Handle(DeleteAppointmentTypeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.AppointmentType? appointmentType = await _appointmentTypeRepository.GetByIdAsync(request.Id);

            if (appointmentType == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Appointment type is not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _appointmentTypeRepository.SoftDeleteSingle(
                appointmentType,
                request.IsHard,
                ct
            );

            if (await CommitAsync())
            {
                await Bus.RaiseEventAsync(new AppointmentTypeDeletedEvent(request.Id));
            }
        }
    }
}
