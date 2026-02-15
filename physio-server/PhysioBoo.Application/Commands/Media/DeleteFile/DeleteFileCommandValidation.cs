using FluentValidation;

namespace PhysioBoo.Application.Commands.Media.DeleteFile
{
    public sealed class DeleteFileCommandValidation : AbstractValidator<DeleteFileCommand>
    {
        public DeleteFileCommandValidation()
        {
            RuleForUrl();
        }

        public void RuleForUrl()
        {
            RuleFor(cmd => cmd.Url).NotEmpty().WithErrorCode("MEDIA_URL_EMPTY").WithMessage("URL may not be empty.");
        }
    }
}
