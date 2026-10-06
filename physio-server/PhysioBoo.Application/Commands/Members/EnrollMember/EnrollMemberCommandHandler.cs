using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Members.EnrollMember
{
    public sealed class EnrollMemberCommandHandler : CommandHandlerBase, IRequestHandler<EnrollMemberCommand>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public EnrollMemberCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMemberRepository memberRepository,
            IPatientRepository patientRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _memberRepository = memberRepository;
            _patientRepository = patientRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(EnrollMemberCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Patient? patient = await _patientRepository.GetByIdAsync(request.NewMember.PatientId, ct: cancellationToken);
            if (patient == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {request.NewMember.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (await _memberRepository.ExistsAsync(m => m.PatientId == request.NewMember.PatientId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This patient is already enrolled as a member.",
                    DomainErrorCodes.Member.AlreadyEnrolled
                ));
                return;
            }

            string code = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(MemberPoint), cancellationToken);

            MemberPoint newMember = new MemberPoint(
                request.NewId,
                code,
                request.NewMember.PatientId,
                Enum.Parse<MembershipTier>(request.NewMember.Tier, true)
            );

            // Carry over points the patient already has (e.g. earned at the retail POS before enrolling).
            newMember.SetPoints(patient.LoyaltyPoints);

            newMember.SetTenantId(_user.GetTenantId());
            newMember.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _memberRepository.InsertAsync<MemberPoint, Guid>(newMember);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to enroll member: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
