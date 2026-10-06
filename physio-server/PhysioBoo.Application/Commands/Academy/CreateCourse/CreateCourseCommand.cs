using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Commands.Academy.CreateCourse
{
    public sealed class CreateCourseCommand : CommandBase, IRequest
    {
        private static readonly CreateCourseCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveCourseViewModel Input { get; }

        public CourseSummaryViewModel? Result { get; set; }

        public CreateCourseCommand(Guid newId, SaveCourseViewModel input) : base(Guid.NewGuid())
        {
            NewId = newId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
