using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateCard
{
    public sealed class UpdateScrumCardCommand : CommandBase, IRequest
    {
        private static readonly UpdateScrumCardCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveScrumCardViewModel Input { get; }

        public ScrumCardViewModel? Result { get; set; }

        public UpdateScrumCardCommand(Guid id, SaveScrumCardViewModel input) : base(Guid.NewGuid())
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
