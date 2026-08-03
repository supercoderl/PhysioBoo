using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification
{
    public sealed class CreateDoctorCertificationCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorCertificationCommand>
    {
        private readonly IDoctorCertificationRepository _doctorCertificationRepository;
        private readonly IUser _user;

        public CreateDoctorCertificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorCertificationRepository doctorCertificationRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorCertificationRepository = doctorCertificationRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorCertificationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorCertification newDoctorCertification = new DoctorCertification(
                request.NewId,
                request.NewDoctorCertification.DoctorId,
                request.NewDoctorCertification.CertificationName,
                request.NewDoctorCertification.CertificationType,
                request.NewDoctorCertification.IssuingOrganization,
                request.NewDoctorCertification.CertificationNumber,
                request.NewDoctorCertification.IssueDate,
                request.NewDoctorCertification.ExpiryDate,
                request.NewDoctorCertification.IsLifetime,
                request.NewDoctorCertification.VerificationUrl,
                request.NewDoctorCertification.CertificateDocumentUrl
            );

            newDoctorCertification.SetTenantId(_user.GetTenantId());
            newDoctorCertification.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorCertificationRepository.InsertAsync<DoctorCertification, Guid>(newDoctorCertification);

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
