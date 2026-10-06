namespace PhysioBoo.Application.Commands.Scrumboard.DeleteBoard
{
    public sealed class DeleteScrumBoardCommand : CommandBase, IRequest
    {
        private static readonly DeleteScrumBoardCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteScrumBoardCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
