using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Subscriptions.SavePlan
{
    public sealed class SaveSubscriptionPlanCommandHandler : CommandHandlerBase, IRequestHandler<SaveSubscriptionPlanCommand>
    {
        private readonly ISubscriptionPlanRepository _planRepository;
        private readonly IUser _user;

        public SaveSubscriptionPlanCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISubscriptionPlanRepository planRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _planRepository = planRepository;
            _user = user;
        }

        public async Task Handle(SaveSubscriptionPlanCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string code = request.Plan.Code.Trim().ToUpperInvariant();
            string currency = request.Plan.Currency.Trim().ToUpperInvariant();

            SubscriptionPlan? plan;
            if (request.Id.HasValue)
            {
                plan = await _planRepository.GetByIdAsync(request.Id.Value, ct: ct);
                if (plan == null)
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, $"Plan with id {request.Id} doesn't exist.", ErrorCodes.ObjectNotFound));
                    return;
                }
            }
            else
            {
                if (await _planRepository.GetAllNoTracking(p => p.Code == code).AnyAsync(ct))
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, $"A plan with code {code} already exists.", DomainErrorCodes.Subscription.DuplicateCode));
                    return;
                }

                plan = new SubscriptionPlan(request.NewId, code, request.Plan.Name.Trim(), null, request.Plan.MonthlyPrice, currency, null, null, request.Plan.SortOrder);
                plan.SetCreatedBy(_user.GetUserId());
                _planRepository.Add(plan);
            }

            plan.SetName(request.Plan.Name.Trim());
            plan.SetDescription(string.IsNullOrWhiteSpace(request.Plan.Description) ? null : request.Plan.Description.Trim());
            plan.SetMonthlyPrice(request.Plan.MonthlyPrice);
            plan.SetCurrency(currency);
            plan.SetMaxUsers(request.Plan.MaxUsers);
            plan.SetMaxBranches(request.Plan.MaxBranches);
            plan.SetIsActive(request.Plan.IsActive);
            plan.SetSortOrder(request.Plan.SortOrder);
            plan.SetUpdatedBy(_user.GetUserId());

            await CommitAsync();
        }
    }
}
