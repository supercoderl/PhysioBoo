using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource
{
    public sealed class ImportLocalResourceCommandValidation : AbstractValidator<ImportLocalResourceCommand>
    {
        public ImportLocalResourceCommandValidation()
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
                .WithMessage("File may not be empty.")
                .Must(file => Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidFileType)
                .WithMessage("Only .xlsx files are supported.");
        }
    }
}
