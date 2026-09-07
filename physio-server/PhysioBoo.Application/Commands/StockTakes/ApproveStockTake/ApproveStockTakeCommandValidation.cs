

namespace PhysioBoo.Application.Commands.StockTakes.ApproveStockTake
{
    public sealed class ApproveStockTakeCommandValidation : AbstractValidator<ApproveStockTakeCommand>
    {
        public ApproveStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
        }
    }
}
