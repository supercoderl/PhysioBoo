
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.StartStockTake
{
    public sealed class StartStockTakeCommand : CommandBase, IRequest
    {
        private static readonly StartStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }

        public StartStockTakeCommand(Guid id) : base(Guid.NewGuid())
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
