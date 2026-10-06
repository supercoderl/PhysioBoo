using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveCard
{
    public sealed class MoveScrumCardCommand : CommandBase, IRequest
    {
        private static readonly MoveScrumCardCommandValidation s_validation = new();

        public Guid Id { get; }
        public MoveScrumCardViewModel Input { get; }

        public MoveScrumCardCommand(Guid id, MoveScrumCardViewModel input) : base(Guid.NewGuid())
        {
            Id = id;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
