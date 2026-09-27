using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality
{
    public sealed class UpdateImagingModalityCommandValidation : AbstractValidator<UpdateImagingModalityCommand>
    {
        public UpdateImagingModalityCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForDetails();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingModality.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.ImagingModality.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingModality.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 100 characters.");
        }

        public void RuleForDetails()
        {
            RuleFor(cmd => cmd.ImagingModality.Code).MaxLen(100, "Code");
            RuleFor(cmd => cmd.ImagingModality.Category).MaxLen(50, "Category");
            RuleFor(cmd => cmd.ImagingModality.AverageDurationMinutes).NotNegative("Average duration");
            // numeric(8,4) column
            RuleFor(cmd => cmd.ImagingModality.RadiationDose)
                .InclusiveBetween(0, 9999.9999m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Radiation dose is out of range.");
        }
    }
}
