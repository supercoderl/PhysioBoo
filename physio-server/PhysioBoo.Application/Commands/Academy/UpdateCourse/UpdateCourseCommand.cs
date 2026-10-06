using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Commands.Academy.UpdateCourse
{
    public sealed class UpdateCourseCommand : CommandBase, IRequest
    {
        private static readonly UpdateCourseCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveCourseViewModel Input { get; }

        public UpdateCourseCommand(Guid id, SaveCourseViewModel input) : base(Guid.NewGuid())
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
