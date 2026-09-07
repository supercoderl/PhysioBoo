

namespace PhysioBoo.Application.Commands.StockTakes.CreateStockTake
{
    public sealed class CreateStockTakeCommandValidation : AbstractValidator<CreateStockTakeCommand>
    {
        public CreateStockTakeCommandValidation()
        {
            RuleFor(cmd => cmd.NewStockTake.Id).NotEmpty();
            RuleFor(cmd => cmd.NewStockTake.WarehouseId).NotEmpty();
            RuleFor(cmd => cmd.NewStockTake.DepartmentId).NotEmpty();
        }
    }
}
