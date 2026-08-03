using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Hospitals.DeleteHospital
{
    public sealed class DeleteHospitalCommandHandler : CommandHandlerBase, IRequestHandler<DeleteHospitalCommand>
    {
        private readonly IHospitalRepository _hospitalRepository;

        public DeleteHospitalCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalRepository hospitalRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalRepository = hospitalRepository;
        }

        public async Task Handle(DeleteHospitalCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.Hospital? hospital = await _hospitalRepository.GetByIdAsync(request.Id);

            if (hospital == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Hospital not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _hospitalRepository.SoftDeleteSingle(
                hospital,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}