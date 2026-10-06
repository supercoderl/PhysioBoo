using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.CreateAssignment
{
    public sealed class CreateNursingAssignmentCommand : CommandBase, IRequest
    {
        private static readonly CreateNursingAssignmentCommandValidation s_validation = new();

        public CreateNursingAssignmentViewModel Input { get; }

        // Filled by the handler: the created or updated assignment.
        public Guid? ResultId { get; set; }

        public CreateNursingAssignmentCommand(CreateNursingAssignmentViewModel input) : base(Guid.NewGuid())
        {
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
