using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality
{
    public sealed class DeleteImagingModalityCommandValidation : AbstractValidator<DeleteImagingModalityCommand>
    {
        public DeleteImagingModalityCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.ImagingModality.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
