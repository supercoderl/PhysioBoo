using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.HospitalGroups.DeleteHospitalGroup
{
    public sealed class DeleteHospitalGroupCommandHandler : CommandHandlerBase, IRequestHandler<DeleteHospitalGroupCommand>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;

        public DeleteHospitalGroupCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalGroupRepository hospitalGroupRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalGroupRepository = hospitalGroupRepository;
        }

        public async Task Handle(DeleteHospitalGroupCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.HospitalGroup? hospitalGroup = await _hospitalGroupRepository.GetByIdAsync(request.Id);

            if (hospitalGroup == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Hospital group not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _hospitalGroupRepository.SoftDeleteSingle(
                hospitalGroup,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}
