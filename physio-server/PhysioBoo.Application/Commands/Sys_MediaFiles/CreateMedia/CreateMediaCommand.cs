using PhysioBoo.Application.ViewModels.Sys_MediaFiles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Sys_Media.CreateMedia
{
    public sealed class CreateMediaCommand : CommandBase
    {
        private static readonly CreateMediaCommandValidation s_validation = new();

        public CreateMediaViewModel NewMedia { get; set; }

        public CreateMediaCommand(
            CreateMediaViewModel newMedia
        ) : base(Guid.NewGuid())
        {
            NewMedia = newMedia;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
