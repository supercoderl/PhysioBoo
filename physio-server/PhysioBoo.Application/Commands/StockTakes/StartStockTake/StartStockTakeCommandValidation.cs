

namespace PhysioBoo.Application.Commands.StockTakes.StartStockTake
{
    public sealed class StartStockTakeCommandValidation : AbstractValidator<StartStockTakeCommand>
    {
        public StartStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
        }
    }
}
