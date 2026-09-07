

namespace PhysioBoo.Application.Commands.StockTakes.CancelStockTake
{
    public sealed class CancelStockTakeCommandValidation : AbstractValidator<CancelStockTakeCommand>
    {
        public CancelStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
        }
    }
}
