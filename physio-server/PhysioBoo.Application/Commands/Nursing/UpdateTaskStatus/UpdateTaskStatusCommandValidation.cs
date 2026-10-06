using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.UpdateTaskStatus
{
    public sealed class UpdateTaskStatusCommandValidation : AbstractValidator<UpdateTaskStatusCommand>
    {
        public UpdateTaskStatusCommandValidation()
        {
            RuleFor(c => c.TaskId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Task id may not be empty.");

            // A task is only ever completed or cancelled; "Overdue" is derived and "Pending" is the starting state.
            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out NursingTaskStatus s) && (s == NursingTaskStatus.Completed || s == NursingTaskStatus.Cancelled))
                .WithErrorCode(DomainErrorCodes.Nursing.InvalidStatus).WithMessage("Status must be Completed or Cancelled.");
        }
    }
}
