
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTake
{
    public sealed class UpdateStockTakeCommand : CommandBase, IRequest
    {
        private static readonly UpdateStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateStockTakeViewModel Update { get; }

        public UpdateStockTakeCommand(UpdateStockTakeViewModel update, Guid id) : base(Guid.NewGuid())
        {
            Update = update;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
