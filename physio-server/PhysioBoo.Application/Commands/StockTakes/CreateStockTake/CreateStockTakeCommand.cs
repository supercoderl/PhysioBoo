
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.CreateStockTake
{
    public sealed class CreateStockTakeCommand : CommandBase, IRequest
    {
        private static readonly CreateStockTakeCommandValidation s_validation = new();

        public CreateStockTakeViewModel NewStockTake { get; }

        public CreateStockTakeCommand(CreateStockTakeViewModel newStockTake) : base(Guid.NewGuid())
        {
            NewStockTake = newStockTake;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
