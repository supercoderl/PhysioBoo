using FluentValidation;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommandValidation : AbstractValidator<CreateBillCommand>
    {
        public CreateBillCommandValidation()
        {

        }
    }
}
