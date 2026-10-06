namespace PhysioBoo.Application.Commands.Academy.DeleteCourse
{
    public sealed class DeleteCourseCommand : CommandBase, IRequest
    {
        private static readonly DeleteCourseCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteCourseCommand(Guid id) : base(Guid.NewGuid())
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
