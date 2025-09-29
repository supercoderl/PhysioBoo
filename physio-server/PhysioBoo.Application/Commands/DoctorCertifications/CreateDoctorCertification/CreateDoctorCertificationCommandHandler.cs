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

        public CreateDoctorCertificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorCertificationRepository doctorCertificationRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorCertificationRepository = doctorCertificationRepository;
        }

        public async Task Handle(CreateDoctorCertificationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorCertificationRepository.InsertAsync<DoctorCertification, Guid>(new DoctorCertification(
                request.NewDoctorCertification.Id,
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
