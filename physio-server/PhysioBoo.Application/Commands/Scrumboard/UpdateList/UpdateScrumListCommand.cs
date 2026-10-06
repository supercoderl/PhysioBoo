using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateList
{
    public sealed class UpdateScrumListCommand : CommandBase, IRequest
    {
        private static readonly UpdateScrumListCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveScrumListViewModel Input { get; }

        public UpdateScrumListCommand(Guid id, SaveScrumListViewModel input) : base(Guid.NewGuid())
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
