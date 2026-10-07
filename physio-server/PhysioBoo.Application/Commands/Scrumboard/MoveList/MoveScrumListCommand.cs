using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveList
{
    public sealed class MoveScrumListCommand : CommandBase, IRequest
    {
        private static readonly MoveScrumListCommandValidation s_validation = new();

        public Guid Id { get; }
        public MoveScrumListViewModel Input { get; }

        public MoveScrumListCommand(Guid id, MoveScrumListViewModel input) : base(Guid.NewGuid())
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
