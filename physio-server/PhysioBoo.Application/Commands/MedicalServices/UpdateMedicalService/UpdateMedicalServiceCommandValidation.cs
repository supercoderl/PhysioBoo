using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalServices.UpdateMedicalService
{
    public sealed class UpdateMedicalServiceCommandValidation : AbstractValidator<UpdateMedicalServiceCommand>
    {
        public UpdateMedicalServiceCommandValidation()
        {
            RuleFor(c => c.MedicalService.Code)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.MedicalService.CodeExceedsMaxLength)
                .When(c => c.MedicalService.Code != null);

            RuleFor(c => c.MedicalService.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.MedicalService.EmptyName)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.MedicalService.NameExceedsMaxLength)
                .When(c => c.MedicalService.Name != null);

            RuleFor(c => c.MedicalService.BasePrice)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.MedicalService.InvalidPrice)
                .When(c => c.MedicalService.BasePrice.HasValue);

            RuleFor(c => c.MedicalService.DurationMinutes)
                .GreaterThanOrEqualTo(1).WithErrorCode(DomainErrorCodes.MedicalService.InvalidDuration)
                .When(c => c.MedicalService.DurationMinutes.HasValue);
        }
    }
}