using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Commands.Members.AddPoints
{
    public sealed class AddPointsCommand : CommandBase, IRequest
    {
        private static readonly AddPointsCommandValidation s_validation = new();

        public Guid MemberId { get; }
        public AddPointsViewModel Input { get; }

        public AddPointsCommand(Guid memberId, AddPointsViewModel input) : base(Guid.NewGuid())
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
