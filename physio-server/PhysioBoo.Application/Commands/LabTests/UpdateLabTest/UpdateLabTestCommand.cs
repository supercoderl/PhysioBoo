using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand
{
    public sealed class UpdateLabTestCommand : CommandBase
    {
        private static readonly UpdateLabTestCommandValidation s_validation = new();

        public UpdateLabTestViewModel LabTest { get; }

        public UpdateLabTestCommand(UpdateLabTestViewModel labTest) : base(Guid.NewGuid())
        {
            LabTest = labTest;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
