using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Members.DeleteMember
{
    public sealed class DeleteMemberCommandHandler : CommandHandlerBase, IRequestHandler<DeleteMemberCommand>
    {
        private readonly IMemberRepository _memberRepository;

        public DeleteMemberCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMemberRepository memberRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _memberRepository = memberRepository;
        }

        public async Task Handle(DeleteMemberCommand request, CancellationToken cancellationToken)
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

            // Soft delete only: the point ledger must keep its history (hard delete is blocked by the FK).
            _memberRepository.SoftDeleteSingle(member, false, cancellationToken);

            await CommitAsync();
        }
    }
}
