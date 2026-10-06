using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Commands.Members.RedeemPoints
{
    public sealed class RedeemPointsCommand : CommandBase, IRequest
    {
        private static readonly RedeemPointsCommandValidation s_validation = new();

        public Guid MemberId { get; }
        public RedeemPointsViewModel Input { get; }

        public RedeemPointsCommand(Guid memberId, RedeemPointsViewModel input) : base(Guid.NewGuid())
        {
            MemberId = memberId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
