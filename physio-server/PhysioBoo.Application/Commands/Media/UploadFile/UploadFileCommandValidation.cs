using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Media.UploadFile
{
    public sealed class UploadFileCommandValidation : AbstractValidator<UploadFileCommand>
    {
        public UploadFileCommandValidation()
        {
            RuleForFile();
        }

        public void RuleForFile()
        {
            RuleFor(cmd => cmd.File)
                .NotNull()
                .WithErrorCode(DomainErrorCodes.Validation.EmptyFile)
                .WithMessage("File may not be empty.")
                .Must(file => file.Length > 0)
                .WithErrorCode(DomainErrorCodes.Validation.EmptyFile)
                .WithMessage("File may not be empty.");
        }
    }
}
