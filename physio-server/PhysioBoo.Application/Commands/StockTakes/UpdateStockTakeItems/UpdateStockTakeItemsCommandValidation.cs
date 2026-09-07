

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTakeItems
{
    public sealed class UpdateStockTakeItemsCommandValidation : AbstractValidator<UpdateStockTakeItemsCommand>
    {
        public UpdateStockTakeItemsCommandValidation()
        {
            RuleFor(cmd => cmd.StockTakeId).NotEmpty();
            RuleFor(cmd => cmd.Update.Items).NotEmpty();
        }
    }
}
