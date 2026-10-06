namespace PhysioBoo.Application.Commands.Academy.DeleteLesson
{
    public sealed class DeleteLessonCommand : CommandBase, IRequest
    {
        private static readonly DeleteLessonCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteLessonCommand(Guid id) : base(Guid.NewGuid())
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
