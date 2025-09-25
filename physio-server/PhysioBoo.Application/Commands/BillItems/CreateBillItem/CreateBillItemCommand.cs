using MediatR;
using PhysioBoo.Application.ViewModels.BillItems;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.BillItems.CreateBillItem
{
    public sealed class CreateBillItemCommand : CommandBase, IRequest
    {
        private static readonly CreateBillItemCommandValidation s_validation = new();

        public CreateBillItemViewModel NewBillItem { get; }

        public CreateBillItemCommand(CreateBillItemViewModel newBillItem) : base(Guid.NewGuid())
        {
            NewBillItem = newBillItem;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
