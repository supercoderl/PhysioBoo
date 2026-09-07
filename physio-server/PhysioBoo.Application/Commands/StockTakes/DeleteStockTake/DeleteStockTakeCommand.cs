
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.DeleteStockTake
{
    public sealed class DeleteStockTakeCommand : CommandBase, IRequest
    {
        private static readonly DeleteStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteStockTakeCommand(Guid id) : base(Guid.NewGuid())
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
