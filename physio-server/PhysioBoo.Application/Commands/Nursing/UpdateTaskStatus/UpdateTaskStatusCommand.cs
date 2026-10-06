using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.UpdateTaskStatus
{
    public sealed class UpdateTaskStatusCommand : CommandBase, IRequest
    {
        private static readonly UpdateTaskStatusCommandValidation s_validation = new();

        public Guid TaskId { get; }
        public UpdateTaskStatusViewModel Input { get; }

        // Filled by the handler so the endpoint can return the updated task.
        public NursingTaskViewModel? Result { get; set; }

        public UpdateTaskStatusCommand(Guid taskId, UpdateTaskStatusViewModel input) : base(Guid.NewGuid())
        {
            TaskId = taskId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
