using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand
{
    public sealed class UpdateLabTestCommand : CommandBase
    {
        private static readonly UpdateLabTestCommandValidation s_validation = new();

        public UpdateLabTestViewModel LabTest { get; }
        public Guid Id { get; }

        public UpdateLabTestCommand(UpdateLabTestViewModel labTest, Guid id) : base(Guid.NewGuid())
        {
            LabTest = labTest;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
