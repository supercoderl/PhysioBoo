using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.UpdateWard
{
    public sealed class UpdateWardCommandValidation : AbstractValidator<UpdateWardCommand>
    {
        public UpdateWardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Ward.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Ward.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Ward.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Ward.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.Ward.Code)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Ward.CodeExceedsMaxLength).WithMessage("Code may not exceed 32 characters.")
                .When(c => c.Ward.Code != null);

            RuleFor(c => c.Ward.Floor)
                .InclusiveBetween(-5, 200).WithErrorCode(DomainErrorCodes.Ward.InvalidFloor).WithMessage("Floor must be between -5 and 200.");
        }
    }
}
