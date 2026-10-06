namespace PhysioBoo.Application.Commands.Scrumboard.DeleteList
{
    public sealed class DeleteScrumListCommand : CommandBase, IRequest
    {
        private static readonly DeleteScrumListCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteScrumListCommand(Guid id) : base(Guid.NewGuid())
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
