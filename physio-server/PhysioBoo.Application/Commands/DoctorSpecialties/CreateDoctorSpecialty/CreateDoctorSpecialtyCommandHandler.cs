using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty
{
    public sealed class CreateDoctorSpecialtyCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorSpecialtyCommand>
    {
        private readonly IDoctorSpecialtyRepository _doctorSpecialtyRepository;

        public CreateDoctorSpecialtyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorSpecialtyRepository doctorSpecialtyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorSpecialtyRepository = doctorSpecialtyRepository;
        }

        public async Task Handle(CreateDoctorSpecialtyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorSpecialtyRepository.InsertAsync<DoctorSpecialty, Guid>(new DoctorSpecialty(
                request.NewDoctorSpecialty.Id,
                request.NewDoctorSpecialty.DoctorId,
                request.NewDoctorSpecialty.SpecialtyId,
                request.NewDoctorSpecialty.CertificationNumber,
                request.NewDoctorSpecialty.CertificationDate,
                request.NewDoctorSpecialty.CertificationExpiry
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}