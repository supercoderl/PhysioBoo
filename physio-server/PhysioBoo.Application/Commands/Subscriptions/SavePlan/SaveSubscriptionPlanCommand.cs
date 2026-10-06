using PhysioBoo.Application.ViewModels.Subscriptions;

namespace PhysioBoo.Application.Commands.Subscriptions.SavePlan
{
    /// <summary>
    /// Creates a plan (when <see cref="Id"/> is null) or updates an existing one. The code is immutable once created.
    /// </summary>
    public sealed class SaveSubscriptionPlanCommand : CommandBase, IRequest
    {
        private static readonly SaveSubscriptionPlanCommandValidation s_validation = new();

        public Guid? Id { get; }
        public Guid NewId { get; }
        public SaveSubscriptionPlanViewModel Plan { get; }

        public SaveSubscriptionPlanCommand(Guid? id, SaveSubscriptionPlanViewModel plan) : base(id ?? Guid.NewGuid())
        {
            Id = id;
            NewId = id ?? AggregateId;
            Plan = plan;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
