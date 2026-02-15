using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.MedicalSpecialties;

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

            Domain.Entities.MedicalStaff.MedicalSpecialty? medicalSpecialty = await _medicalSpecialtyRepository.GetByIdAsync(request.Id);

            if (medicalSpecialty == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Medical Specialty not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _medicalSpecialtyRepository.SoftDeleteSingle(
                medicalSpecialty,
                request.IsHard,
                cancellationToken
            );

            if (await CommitAsync())
            {
                await Bus.RaiseEventAsync(new MedicalSpecialtyDeletedEvent(request.Id));
            }
        }
    }
}
