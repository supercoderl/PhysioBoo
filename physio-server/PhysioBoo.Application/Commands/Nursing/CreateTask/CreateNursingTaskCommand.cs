using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.CreateTask
{
    public sealed class CreateNursingTaskCommand : CommandBase, IRequest
    {
        private static readonly CreateNursingTaskCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public CreateNursingTaskViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new task.
        public NursingTaskViewModel? Result { get; set; }

        public CreateNursingTaskCommand(Guid patientId, CreateNursingTaskViewModel input) : base(Guid.NewGuid())
        {
            PatientId = patientId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
