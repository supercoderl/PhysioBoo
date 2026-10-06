using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateBoard
{
    public sealed class UpdateScrumBoardCommand : CommandBase, IRequest
    {
        private static readonly UpdateScrumBoardCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveScrumBoardViewModel Input { get; }

        public UpdateScrumBoardCommand(Guid id, SaveScrumBoardViewModel input) : base(Guid.NewGuid())
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
