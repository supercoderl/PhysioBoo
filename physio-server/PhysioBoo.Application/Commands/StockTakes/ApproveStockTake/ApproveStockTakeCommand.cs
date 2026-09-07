
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.ApproveStockTake
{
    public sealed class ApproveStockTakeCommand : CommandBase, IRequest
    {
        private static readonly ApproveStockTakeCommandValidation s_validation = new();

        public Guid Id { get; }
        public ApproveStockTakeViewModel Approval { get; }

        public ApproveStockTakeCommand(Guid id, ApproveStockTakeViewModel approval) : base(Guid.NewGuid())
        {
            Id = id;
            Approval = approval;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
