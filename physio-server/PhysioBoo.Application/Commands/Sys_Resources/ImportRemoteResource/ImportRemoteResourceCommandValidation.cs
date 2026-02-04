using FluentValidation;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource
{
    public sealed class ImportRemoteResourceCommandValidation : AbstractValidator<ImportRemoteResourceCommand>
    {
        public ImportRemoteResourceCommandValidation()
        {
            RuleForUrl();
        }

        public void RuleForUrl()
        {
            RuleFor(cmd => cmd.Url).NotEmpty().WithErrorCode("IMPORT_RESOURCE_URL").WithMessage("The URL for importing resources cannot be empty.");
        }
    }
}
