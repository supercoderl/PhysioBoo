namespace PhysioBoo.Application.Commands.Scrumboard.DeleteCard
{
    public sealed class DeleteScrumCardCommand : CommandBase, IRequest
    {
        private static readonly DeleteScrumCardCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteScrumCardCommand(Guid id) : base(Guid.NewGuid())
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
