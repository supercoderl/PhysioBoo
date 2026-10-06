using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Commands.Academy.CreateLesson
{
    public sealed class CreateLessonCommand : CommandBase, IRequest
    {
        private static readonly CreateLessonCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid CourseId { get; }
        public SaveLessonViewModel Input { get; }

        public LessonViewModel? Result { get; set; }

        public CreateLessonCommand(Guid newId, Guid courseId, SaveLessonViewModel input) : base(Guid.NewGuid())
        {
            NewId = newId;
            CourseId = courseId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
