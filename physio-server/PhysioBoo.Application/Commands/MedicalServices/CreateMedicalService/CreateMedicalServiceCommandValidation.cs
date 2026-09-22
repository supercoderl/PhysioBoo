using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalServices.CreateMedicalService
{
    public sealed class CreateMedicalServiceCommandValidation : AbstractValidator<CreateMedicalServiceCommand>
    {
        public CreateMedicalServiceCommandValidation()
        {
            RuleFor(c => c.NewMedicalService.Code)
                .NotEmpty().WithErrorCode(DomainErrorCodes.MedicalService.EmptyCode).WithMessage("Code may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.MedicalService.CodeExceedsMaxLength).WithMessage("Code may not exceed 32 characters.");

            RuleFor(c => c.NewMedicalService.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.MedicalService.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.MedicalService.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.NewMedicalService.BasePrice)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.MedicalService.InvalidPrice).WithMessage("Base price cannot be negative.");

            RuleFor(c => c.NewMedicalService.Currency)
                .NotEmpty().Length(3).WithErrorCode(DomainErrorCodes.MedicalService.InvalidCurrency).WithMessage("Currency must be a 3-letter code.");

            RuleFor(c => c.NewMedicalService.DurationMinutes)
                .GreaterThanOrEqualTo(1).WithErrorCode(DomainErrorCodes.MedicalService.InvalidDuration).WithMessage("Duration must be at least 1 minute.");
        }
    }
}