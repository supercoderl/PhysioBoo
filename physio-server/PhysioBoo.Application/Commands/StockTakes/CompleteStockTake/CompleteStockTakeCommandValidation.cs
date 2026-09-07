

namespace PhysioBoo.Application.Commands.StockTakes.CompleteStockTake
{
    public sealed class CompleteStockTakeCommandValidation : AbstractValidator<CompleteStockTakeCommand>
    {
        public CompleteStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
        }
    }
}
