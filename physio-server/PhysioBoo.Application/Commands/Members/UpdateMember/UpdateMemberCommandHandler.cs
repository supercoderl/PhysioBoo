using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Members.UpdateMember
{
    public sealed class UpdateMemberCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMemberCommand>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IUser _user;

        public UpdateMemberCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMemberRepository memberRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _memberRepository = memberRepository;
            _user = user;
        }

        public async Task Handle(UpdateMemberCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MemberPoint? member = await _memberRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (member == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Member with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            MembershipTier tier = Enum.Parse<MembershipTier>(request.Member.Tier, true);
            MemberStatus status = Enum.Parse<MemberStatus>(request.Member.Status, true);
            Guid? userId = _user.GetUserId();
            DateTime? now = TimeZoneHelper.GetLocalTimeNow();

            // Update only the columns this command owns. UpdateTrackedAsync would rewrite the whole row,
            // including Points, and could overwrite a balance change made a moment earlier.
            await _memberRepository.BatchUpdateMultipleAsync(
                m => m.Id == request.Id,
                s => s
                    .SetProperty(m => m.Tier, tier)
                    .SetProperty(m => m.Status, status)
                    .SetProperty(m => m.UpdatedBy, userId)
                    .SetProperty(m => m.UpdatedAt, now),
                cancellationToken
            );
        }
    }
}
