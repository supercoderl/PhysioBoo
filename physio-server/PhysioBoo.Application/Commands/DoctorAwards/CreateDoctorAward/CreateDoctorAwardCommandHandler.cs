using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward
{
    public sealed class CreateDoctorAwardCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorAwardCommand>
    {
        private readonly IDoctorAwardRepository _doctorAwardRepository;

        public CreateDoctorAwardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorAwardRepository doctorAwardRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorAwardRepository = doctorAwardRepository;
        }

        public async Task Handle(CreateDoctorAwardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorAwardRepository.InsertAsync<DoctorAward, Guid>(new DoctorAward(
                request.NewDoctorAward.Id,
                request.NewDoctorAward.DoctorId,
                request.NewDoctorAward.AwardName,
                request.NewDoctorAward.AwardCategory,
                request.NewDoctorAward.AwardingOrganization,
                request.NewDoctorAward.AwardLevel,
                request.NewDoctorAward.AwardDate,
                request.NewDoctorAward.AwardYear,
                request.NewDoctorAward.Description,
                request.NewDoctorAward.MonetaryValue,
                request.NewDoctorAward.CertificateUrl,
                request.NewDoctorAward.MediaCoverageUrl
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
