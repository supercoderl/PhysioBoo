using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateCard
{
    public sealed class CreateScrumCardCommand : CommandBase, IRequest
    {
        private static readonly CreateScrumCardCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid ListId { get; }
        public SaveScrumCardViewModel Input { get; }

        public ScrumCardViewModel? Result { get; set; }

        public CreateScrumCardCommand(Guid newId, Guid listId, SaveScrumCardViewModel input) : base(Guid.NewGuid())
        {
            NewId = newId;
            ListId = listId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
