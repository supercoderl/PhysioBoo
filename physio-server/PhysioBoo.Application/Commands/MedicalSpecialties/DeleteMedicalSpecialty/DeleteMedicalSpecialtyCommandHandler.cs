using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty
{
    public sealed class DeleteMedicalSpecialtyCommandHandler : CommandHandlerBase, IRequestHandler<DeleteMedicalSpecialtyCommand>
    {
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;

        public DeleteMedicalSpecialtyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalSpecialtyRepository medicalSpecialtyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
        }

        public async Task Handle(DeleteMedicalSpecialtyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            await _medicalSpecialtyRepository.BulkSoftDeleteAsync(
                predicate: ms => ms.Id == request.Id,
                request.IsHard,
                cancellationToken
            );
        }
    }
}
