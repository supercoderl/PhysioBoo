using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.InsuranceClaims.ProcessInsuranceClaim
{
    public sealed class ProcessInsuranceClaimCommandHandler : CommandHandlerBase, IRequestHandler<ProcessInsuranceClaimCommand>
    {
        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly IUser _user;

        public ProcessInsuranceClaimCommandHandler(
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

        public async Task Handle(ProcessInsuranceClaimCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            InsuranceClaim? claim = await _claimRepository.GetByIdAsync(request.Id, includeProperties: "Documents", ct: ct);
            if (claim == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Insurance claim with id {request.Id} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            DateTime now = DateTime.UtcNow;
            string fromStatus = claim.Status.ToString();
            string timelineEvent;
            string auditDetails;

            switch (request.Action)
            {
                case InsuranceClaimAction.Submit:
                    if (!claim.CanSubmit()) { await RejectTransitionAsync(request, claim); return; }

                    int missing = claim.MissingRequiredDocumentsCount();
                    if (missing > 0)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"{missing} required document(s) are still missing.", DomainErrorCodes.InsuranceClaim.MissingDocuments));
                        return;
                    }

                    timelineEvent = claim.Status == InsuranceClaimStatus.NeedCorrection ? "HospitalResponded" : "Submitted";
                    claim.Submit(now);
                    auditDetails = "Claim submitted to insurer";
                    break;

                case InsuranceClaimAction.Approve:
                    if (!claim.CanDecide()) { await RejectTransitionAsync(request, claim); return; }

                    if (request.Amount!.Value > claim.ClaimAmount)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, "Approved amount may not exceed the claimed amount.", DomainErrorCodes.InsuranceClaim.InvalidAmount));
                        return;
                    }

                    claim.Approve(request.Amount.Value, now);
                    timelineEvent = "Approved";
                    auditDetails = $"Approved {request.Amount.Value:N0} of {claim.ClaimAmount:N0}";
                    break;

                case InsuranceClaimAction.Reject:
                    if (!claim.CanDecide()) { await RejectTransitionAsync(request, claim); return; }

                    claim.Reject(request.Text!.Trim(), now);
                    timelineEvent = "Rejected";
                    auditDetails = $"Rejected: {request.Text.Trim()}";
                    break;

                case InsuranceClaimAction.Appeal:
                    if (!claim.CanAppeal()) { await RejectTransitionAsync(request, claim); return; }

                    claim.Appeal(request.Text!.Trim());
                    timelineEvent = "Appealed";
                    auditDetails = "Appeal filed";
                    break;

                case InsuranceClaimAction.Settle:
                    if (!claim.CanSettle()) { await RejectTransitionAsync(request, claim); return; }

                    if (request.Amount!.Value > (claim.ApprovedAmount ?? claim.ClaimAmount))
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, "Settled amount may not exceed the approved amount.", DomainErrorCodes.InsuranceClaim.InvalidAmount));
                        return;
                    }

                    claim.Settle(request.Amount.Value, request.EffectiveDate ?? now, request.Method!.Trim());
                    timelineEvent = "Settled";
                    auditDetails = $"Settled {request.Amount.Value:N0} via {request.Method.Trim()}";
                    break;

                default:
                    await NotifyAsync(new DomainNotification(request.MessageType, "Action is not valid.", DomainErrorCodes.InsuranceClaim.InvalidAction));
                    return;
            }

            claim.Activities.Add(InsuranceClaimActivityFactory.Create(_user, claim.Id, InsuranceClaimActivityKind.Timeline, timelineEvent, message: string.IsNullOrWhiteSpace(request.Text) ? null : request.Text.Trim()));
            claim.Activities.Add(InsuranceClaimActivityFactory.Create(_user, claim.Id, InsuranceClaimActivityKind.Audit, request.Action.ToString(), details: $"{auditDetails} ({fromStatus} → {claim.Status})"));

            claim.SetUpdatedBy(_user.GetUserId());

            await CommitAsync();
        }

        private Task RejectTransitionAsync(ProcessInsuranceClaimCommand request, InsuranceClaim claim)
        {
            return NotifyAsync(new DomainNotification(
                request.MessageType,
                $"Cannot {request.Action.ToString().ToLowerInvariant()} a claim that is {claim.Status}.",
                DomainErrorCodes.InsuranceClaim.InvalidStatusTransition
            ));
        }
    }
}
