using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommand : CommandBase, IRequest
    {
        private static readonly CreateLabTestCommandValidation s_validation = new();

        public CreateLabTestViewModel NewLabTest { get; }
        public Guid NewId { get; }

        public CreateLabTestCommand(CreateLabTestViewModel newLabTest, Guid newId) : base(Guid.NewGuid())
        {
            NewLabTest = newLabTest;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
