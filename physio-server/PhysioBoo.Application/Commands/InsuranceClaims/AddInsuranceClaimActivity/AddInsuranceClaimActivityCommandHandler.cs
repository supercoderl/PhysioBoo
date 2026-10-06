using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.InsuranceClaims.AddInsuranceClaimActivity
{
    public sealed class AddInsuranceClaimActivityCommandHandler : CommandHandlerBase, IRequestHandler<AddInsuranceClaimActivityCommand>
    {
        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly IUser _user;

        public AddInsuranceClaimActivityCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceClaimRepository claimRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _claimRepository = claimRepository;
            _user = user;
        }

        public async Task Handle(AddInsuranceClaimActivityCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            InsuranceClaim? claim = await _claimRepository.GetByIdAsync(request.ClaimId, ct: ct);
            if (claim == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Insurance claim with id {request.ClaimId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            string message = request.Message.Trim();
            bool isMessage = request.Kind == InsuranceClaimActivityKind.Message;

            claim.Activities.Add(InsuranceClaimActivityFactory.Create(
                _user,
                claim.Id,
                request.Kind,
                eventType: null,
                message: message,
                direction: isMessage ? request.Direction ?? "Outbound" : null,
                id: request.NewId
            ));

            claim.Activities.Add(InsuranceClaimActivityFactory.Create(
                _user,
                claim.Id,
                InsuranceClaimActivityKind.Audit,
                isMessage ? "MessageSent" : "NoteAdded",
                details: message.Length > 120 ? message[..120] + "…" : message
            ));

            await CommitAsync();
        }
    }
}
