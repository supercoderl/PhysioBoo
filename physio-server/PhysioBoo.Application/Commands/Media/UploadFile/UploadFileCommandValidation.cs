using FluentValidation;

namespace PhysioBoo.Application.Commands.Media.UploadFile
{
    public sealed class UploadFileCommandValidation : AbstractValidator<UploadFileCommand>
    {
        public UploadFileCommandValidation()
        {

        }
    }
}
