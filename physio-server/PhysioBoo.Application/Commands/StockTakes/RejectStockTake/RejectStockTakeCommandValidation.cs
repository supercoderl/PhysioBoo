

namespace PhysioBoo.Application.Commands.StockTakes.RejectStockTake
{
    public sealed class RejectStockTakeCommandValidation : AbstractValidator<RejectStockTakeCommand>
    {
        public RejectStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
            RuleFor(cmd => cmd.Rejection.Reason).NotEmpty();
        }
    }
}
