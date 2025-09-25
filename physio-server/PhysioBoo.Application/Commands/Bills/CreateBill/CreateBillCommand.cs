using MediatR;
using PhysioBoo.Application.ViewModels.Bills;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommand : CommandBase, IRequest
    {
        private static readonly CreateBillCommandValidation s_validation = new();

        public CreateBillViewModel NewBill { get; }
        public Guid UserId { get; }

        public CreateBillCommand(CreateBillViewModel newBill, Guid userId) : base(Guid.NewGuid())
        {
            NewBill = newBill;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
