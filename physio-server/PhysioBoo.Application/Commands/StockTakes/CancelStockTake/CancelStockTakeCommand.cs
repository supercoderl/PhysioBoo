
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.CancelStockTake
{
    public sealed class CancelStockTakeCommand : CommandBase, IRequest
    {
        private static readonly CancelStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }

        public CancelStockTakeCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
