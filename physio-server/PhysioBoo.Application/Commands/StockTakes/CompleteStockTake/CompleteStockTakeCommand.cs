
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.CompleteStockTake
{
    public sealed class CompleteStockTakeCommand : CommandBase, IRequest
    {
        private static readonly CompleteStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }

        public CompleteStockTakeCommand(Guid id) : base(Guid.NewGuid())
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
