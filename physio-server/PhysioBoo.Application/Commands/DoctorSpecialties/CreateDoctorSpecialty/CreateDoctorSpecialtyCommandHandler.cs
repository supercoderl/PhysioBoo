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
        private readonly IUser _user;

        public CreateDoctorSpecialtyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorSpecialtyRepository doctorSpecialtyRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorSpecialtyRepository = doctorSpecialtyRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorSpecialtyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorSpecialty newDoctorSpecialty = new DoctorSpecialty(
                request.NewDoctorSpecialty.Id,
                request.NewDoctorSpecialty.DoctorId,
                request.NewDoctorSpecialty.SpecialtyId,
                request.NewDoctorSpecialty.CertificationNumber,
                request.NewDoctorSpecialty.CertificationDate,
                request.NewDoctorSpecialty.CertificationExpiry
            );

            newDoctorSpecialty.SetTenantId(_user.GetTenantId());
            newDoctorSpecialty.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorSpecialtyRepository.InsertAsync<DoctorSpecialty, Guid>(newDoctorSpecialty);

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