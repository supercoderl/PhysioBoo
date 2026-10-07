using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Subscriptions.ChangeSubscription
{
    /// <summary>
    /// Super-admin control over a tenant's subscription. Creates the subscription on first use for
    /// tenants that registered before billing existed.
    /// </summary>
    public sealed class ChangeSubscriptionCommandHandler : CommandHandlerBase, IRequestHandler<ChangeSubscriptionCommand>
    {
        private readonly ITenantSubscriptionRepository _subscriptionRepository;
        private readonly ISubscriptionPlanRepository _planRepository;
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly IUser _user;

        public ChangeSubscriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITenantSubscriptionRepository subscriptionRepository,
            ISubscriptionPlanRepository planRepository,
            IHospitalGroupRepository hospitalGroupRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _subscriptionRepository = subscriptionRepository;
            _planRepository = planRepository;
            _hospitalGroupRepository = hospitalGroupRepository;
            _user = user;
        }

        public async Task Handle(ChangeSubscriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _hospitalGroupRepository.ExistsAsync(request.HospitalGroupId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Tenant with id {request.HospitalGroupId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            SubscriptionPlan? plan = null;
            if (request.PlanId.HasValue)
            {
                plan = await _planRepository.GetByIdAsync(request.PlanId.Value, ct: ct);
                if (plan == null || !plan.IsActive)
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, "The selected plan doesn't exist or is no longer offered.", DomainErrorCodes.Subscription.PlanInactive));
                    return;
                }
            }

            TenantSubscription? subscription = await _subscriptionRepository
                .GetAll(s => s.HospitalGroupId == request.HospitalGroupId).AsTracking()
                .FirstOrDefaultAsync(ct);

            if (subscription == null)
            {
                plan ??= await _planRepository.GetAll(p => p.IsActive).OrderBy(p => p.SortOrder).FirstOrDefaultAsync(ct);
                if (plan == null)
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, "No active plan exists to subscribe this tenant to.", DomainErrorCodes.Subscription.PlanInactive));
                    return;
                }

                subscription = new TenantSubscription(Guid.NewGuid(), request.HospitalGroupId, plan.Id, SubscriptionStatus.Active, now);
                subscription.SetCreatedBy(_user.GetUserId());
                _subscriptionRepository.Add(subscription);
            }

            switch (request.Action)
            {
                case SubscriptionAction.ChangePlan:
                    subscription.ChangePlan(plan!.Id);
                    if (subscription.Status == SubscriptionStatus.Cancelled) subscription.Activate(now);
                    break;

                case SubscriptionAction.Activate:
                    subscription.Activate(now);
                    break;

                case SubscriptionAction.MarkPastDue:
                    if (subscription.Status == SubscriptionStatus.Cancelled)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, "A cancelled subscription can't be marked past due.", DomainErrorCodes.Subscription.InvalidState));
                        return;
                    }
                    subscription.MarkPastDue();
                    break;

                case SubscriptionAction.Cancel:
                    subscription.Cancel(now);
                    break;

                case SubscriptionAction.UpdateDetails:
                    break;
            }

            if (request.BillingEmail != null) subscription.SetBillingEmail(string.IsNullOrWhiteSpace(request.BillingEmail) ? null : request.BillingEmail.Trim());
            if (request.Notes != null) subscription.SetNotes(string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim());
            subscription.SetUpdatedBy(_user.GetUserId());

            await CommitAsync();
        }
    }
}
