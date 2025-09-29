using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BillItems.CreateBillItem
{
    public sealed class CreateBillItemCommandValidation : AbstractValidator<CreateBillItemCommand>
    {
        public CreateBillItemCommandValidation()
        {
            RuleForBillId();
        }

        public void RuleForBillId()
        {
            RuleFor(cmd => cmd.NewBillItem.BillId).NotEmpty().WithErrorCode(DomainErrorCodes.BillItem.EmptyBillId).WithMessage("Bill id may not be empty.");
        }
    }
}
