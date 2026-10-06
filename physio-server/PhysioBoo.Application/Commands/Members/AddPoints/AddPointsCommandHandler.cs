using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Members.AddPoints
{
    public sealed class AddPointsCommandHandler : CommandHandlerBase, IRequestHandler<AddPointsCommand>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public AddPointsCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMemberRepository memberRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _memberRepository = memberRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(AddPointsCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MemberPoint? member = await _memberRepository.GetByIdAsync(request.MemberId, ct: cancellationToken);
            if (member == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Member with id {request.MemberId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (member.Status != MemberStatus.Active)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    PointChangeErrors.Describe(DomainErrorCodes.Member.NotActive),
                    DomainErrorCodes.Member.NotActive
                ));
                return;
            }

            // Generate the code before the points transaction: the generator opens its own transaction.
            string code = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(PointTransaction), cancellationToken);

            SharedKernel.Results.DbResult<int> result = await _memberRepository.ApplyPointsAsync(
                request.MemberId,
                PointTransactionType.Earned,
                request.Input.Points,
                code,
                request.Input.Description.Trim(),
                null,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    PointChangeErrors.Describe(result.Error),
                    result.Error ?? ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
