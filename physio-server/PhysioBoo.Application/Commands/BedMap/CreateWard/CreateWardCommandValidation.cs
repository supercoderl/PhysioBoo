using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.CreateWard
{
    public sealed class CreateWardCommandValidation : AbstractValidator<CreateWardCommand>
    {
        public CreateWardCommandValidation()
        {
            RuleFor(c => c.NewWard.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Ward.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Ward.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.NewWard.Code)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Ward.CodeExceedsMaxLength).WithMessage("Code may not exceed 32 characters.")
                .When(c => c.NewWard.Code != null);

            RuleFor(c => c.NewWard.Floor)
                .InclusiveBetween(-5, 200).WithErrorCode(DomainErrorCodes.Ward.InvalidFloor).WithMessage("Floor must be between -5 and 200.");
        }
    }
}
