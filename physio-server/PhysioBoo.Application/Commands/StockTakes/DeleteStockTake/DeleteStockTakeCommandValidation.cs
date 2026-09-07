

namespace PhysioBoo.Application.Commands.StockTakes.DeleteStockTake
{
    public sealed class DeleteStockTakeCommandValidation : AbstractValidator<DeleteStockTakeCommand>
    {
        public DeleteStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
        }
    }
}
