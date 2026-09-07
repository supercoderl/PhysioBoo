
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.RejectStockTake
{
    public sealed class RejectStockTakeCommand : CommandBase, IRequest
    {
        private static readonly RejectStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }
        public RejectStockTakeViewModel Rejection { get; }

        public RejectStockTakeCommand(Guid id, RejectStockTakeViewModel rejection) : base(Guid.NewGuid())
        {
            Id = id;
            Rejection = rejection;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
