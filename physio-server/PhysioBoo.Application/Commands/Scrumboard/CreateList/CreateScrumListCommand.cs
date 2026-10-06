using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateList
{
    public sealed class CreateScrumListCommand : CommandBase, IRequest
    {
        private static readonly CreateScrumListCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid BoardId { get; }
        public SaveScrumListViewModel Input { get; }

        public ScrumListViewModel? Result { get; set; }

        public CreateScrumListCommand(Guid newId, Guid boardId, SaveScrumListViewModel input) : base(Guid.NewGuid())
        {
            NewId = newId;
            BoardId = boardId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
