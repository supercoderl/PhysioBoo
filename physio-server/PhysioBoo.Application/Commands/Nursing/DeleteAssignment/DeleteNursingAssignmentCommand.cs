namespace PhysioBoo.Application.Commands.Nursing.DeleteAssignment
{
    public sealed class DeleteNursingAssignmentCommand : CommandBase, IRequest
    {
        private static readonly DeleteNursingAssignmentCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteNursingAssignmentCommand(Guid id) : base(Guid.NewGuid())
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
