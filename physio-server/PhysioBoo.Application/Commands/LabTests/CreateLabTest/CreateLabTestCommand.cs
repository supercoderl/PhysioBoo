using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommand : CommandBase, IRequest
    {
        private static readonly CreateLabTestCommandValidation s_validation = new();

        public CreateLabTestViewModel NewLabTest { get; }

        public CreateLabTestCommand(CreateLabTestViewModel newLabTest) : base(Guid.NewGuid())
        {
            NewLabTest = newLabTest;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
