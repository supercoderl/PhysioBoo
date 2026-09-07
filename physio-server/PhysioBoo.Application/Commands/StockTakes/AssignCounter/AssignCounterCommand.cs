
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.StockTakes.AssignCounter
{
    public sealed class AssignCounterCommand : CommandBase, IRequest
    {
        private static readonly AssignCounterCommandValidation s_validation = new();

        public Guid Id { get; }
        public AssignCounterViewModel Assignment { get; }

        public AssignCounterCommand(Guid id, AssignCounterViewModel assignment) : base(Guid.NewGuid())
        {
            Id = id;
            Assignment = assignment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
