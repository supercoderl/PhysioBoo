using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommandValidation : AbstractValidator<CreateImagingModalityCommand>
    {
        public CreateImagingModalityCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewImagingModality.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingModality.EmptyName)
                .WithMessage("Name may not be empty.");
        }
    }
}
