
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTakeItems
{
    public sealed class UpdateStockTakeItemsCommand : CommandBase, IRequest
    {
        private static readonly UpdateStockTakeItemsCommandValidation s_validation = new();

        public Guid StockTakeId { get; }
        public UpdateStockTakeItemsViewModel Update { get; }

        public UpdateStockTakeItemsCommand(Guid stockTakeId, UpdateStockTakeItemsViewModel update) : base(Guid.NewGuid())
        {
            StockTakeId = stockTakeId;
            Update = update;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
