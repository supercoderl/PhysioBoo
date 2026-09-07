

namespace PhysioBoo.Application.Commands.StockTakes.AssignCounter
{
    public sealed class AssignCounterCommandValidation : AbstractValidator<AssignCounterCommand>
    {
        public AssignCounterCommandValidation()
        {
            RuleFor(cmd => cmd.Id).NotEmpty();
            RuleFor(cmd => cmd.Assignment.AssignedTo).NotEmpty();
        }
    }
}
