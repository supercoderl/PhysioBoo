using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AppMobiles.UploadApp
{
    public sealed class UploadAppCommand : CommandBase
    {
        private static readonly UploadAppCommandValidation s_validation = new();

        public UploadAppCommand(

        ) : base(Guid.NewGuid())
        {

        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
