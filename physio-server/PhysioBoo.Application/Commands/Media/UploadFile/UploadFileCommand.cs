using Microsoft.AspNetCore.Http;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Media.UploadFile
{
    public sealed class UploadFileCommand : CommandBase
    {
        private static readonly UploadFileCommandValidation s_validation = new();

        public IFormFile File { get; set; }

        public UploadFileCommand(
            IFormFile file
        ) : base(Guid.NewGuid())
        {
            File = file;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
