using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTests.DeleteLabTest
{
    public sealed class DeleteLabTestCommandValidation : AbstractValidator<DeleteLabTestCommand>
    {
        public DeleteLabTestCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
