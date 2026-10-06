using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Commands.Academy.UpdateLesson
{
    public sealed class UpdateLessonCommand : CommandBase, IRequest
    {
        private static readonly UpdateLessonCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveLessonViewModel Input { get; }

        public LessonViewModel? Result { get; set; }

        public UpdateLessonCommand(Guid id, SaveLessonViewModel input) : base(Guid.NewGuid())
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
