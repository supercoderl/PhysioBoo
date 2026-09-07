
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.ReceiveStock
{
    public sealed class ReceiveStockCommand : CommandBase, IRequest
    {
        private static readonly ReceiveStockCommandValidation s_validation = new();

        public ReceiveStockViewModel ReceiveStock { get; }
        public Guid Id { get; }

        public ReceiveStockCommand(ReceiveStockViewModel receiveStock, Guid id) : base(Guid.NewGuid())
        {
            ReceiveStock = receiveStock;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
