using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Media.DeleteFile
{
    public sealed class DeleteFileCommand : CommandBase
    {
        private static readonly DeleteFileCommandValidation s_validation = new();

        public string Url { get; }

        public DeleteFileCommand(string url) : base(Guid.NewGuid())
        {
            Url = url;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
