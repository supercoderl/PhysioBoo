using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sys_MediaFiles.CreateMedia
{
    public sealed class CreateMediaCommandValidation : AbstractValidator<CreateMediaCommand>
    {
        public CreateMediaCommandValidation()
        {
            RuleForFields();
        }

        public void RuleForFields()
        {
            RuleFor(cmd => cmd.NewMedia.PublicId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("PublicId may not be empty.");

            RuleFor(cmd => cmd.NewMedia.Url)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Url may not be empty.");

            RuleFor(cmd => cmd.NewMedia.RefType)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("RefType may not be empty.");
        }
    }
}
