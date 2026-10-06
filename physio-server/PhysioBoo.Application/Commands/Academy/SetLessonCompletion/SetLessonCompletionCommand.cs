namespace PhysioBoo.Application.Commands.Academy.SetLessonCompletion
{
    // Marks a lesson done (Completed = true) or not done (false) for the signed-in user. Repeating it is harmless.
    public sealed class SetLessonCompletionCommand : CommandBase, IRequest
    {
        private static readonly SetLessonCompletionCommandValidation s_validation = new();

        public Guid LessonId { get; }
        public bool Completed { get; }

        public SetLessonCompletionCommand(Guid lessonId, bool completed) : base(Guid.NewGuid())
        {
            LessonId = lessonId;
            Completed = completed;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
