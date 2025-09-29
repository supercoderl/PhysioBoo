using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem
{
    public sealed class CreateLabOrderItemCommandValidation : AbstractValidator<CreateLabOrderItemCommand>
    {
        public CreateLabOrderItemCommandValidation()
        {
            RuleForLabOrderId();
            RuleForLabTestId();
            RuleForTestName();
        }

        public void RuleForLabOrderId()
        {
            RuleFor(cmd => cmd.NewLabOrderItem.LabOrderId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrderItem.EmptyLabOrderId)
                .WithMessage("LabOrderId may not be empty.");
        }

        public void RuleForLabTestId()
        {
            RuleFor(cmd => cmd.NewLabOrderItem.LabTestId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrderItem.EmptyLabTestId)
                .WithMessage("LabTestId may not be empty.");
        }

        public void RuleForTestName()
        {
            RuleFor(cmd => cmd.NewLabOrderItem.TestName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabOrderItem.EmptyTestName)
                .WithMessage("TestName may not be empty.");
        }
    }
}
