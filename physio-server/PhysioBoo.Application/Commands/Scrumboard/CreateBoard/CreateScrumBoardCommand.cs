using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateBoard
{
    public sealed class CreateScrumBoardCommand : CommandBase, IRequest
    {
        private static readonly CreateScrumBoardCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveScrumBoardViewModel Input { get; }

        public ScrumBoardSummaryViewModel? Result { get; set; }

        public CreateScrumBoardCommand(Guid newId, SaveScrumBoardViewModel input) : base(Guid.NewGuid())
        {
            NewId = newId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
