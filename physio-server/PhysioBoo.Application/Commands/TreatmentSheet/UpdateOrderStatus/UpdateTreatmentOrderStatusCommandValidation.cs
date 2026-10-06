using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.TreatmentSheet.UpdateOrderStatus
{
    public sealed class UpdateTreatmentOrderStatusCommandValidation : AbstractValidator<UpdateTreatmentOrderStatusCommand>
    {
        public UpdateTreatmentOrderStatusCommandValidation()
        {
            RuleFor(c => c.OrderId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyId).WithMessage("Order id may not be empty.");

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out TreatmentOrderStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidStatus).WithMessage("Status is not valid.");
        }
    }
}
