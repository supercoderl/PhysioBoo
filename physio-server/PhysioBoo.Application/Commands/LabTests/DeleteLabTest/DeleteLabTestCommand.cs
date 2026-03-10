using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTests.DeleteLabTest.Commands.DeleteLabTestCommand
{
    public sealed class DeleteLabTestCommand : CommandBase
    {
        private static readonly DeleteLabTestCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteLabTestCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
