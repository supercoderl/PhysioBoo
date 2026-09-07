

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTake
{
    public sealed class UpdateStockTakeCommandValidation : AbstractValidator<UpdateStockTakeCommand>
    {
        public UpdateStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
            RuleFor(cmd => cmd.Update.DepartmentId).NotEmpty();
        }
    }
}
