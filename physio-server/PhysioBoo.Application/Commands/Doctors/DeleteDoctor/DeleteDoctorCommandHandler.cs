using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Doctors.DeleteDoctor
{
    public sealed class DeleteDoctorCommandHandler : CommandHandlerBase, IRequestHandler<DeleteDoctorCommand>
    {
        private readonly IDoctorRepository _doctorRepository;

        public DeleteDoctorCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task Handle(DeleteDoctorCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.MedicalStaff.Doctor? doctor = await _doctorRepository.GetByIdAsync(request.Id);

            if (doctor == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Doctor not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _doctorRepository.SoftDeleteSingle(
                doctor,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}