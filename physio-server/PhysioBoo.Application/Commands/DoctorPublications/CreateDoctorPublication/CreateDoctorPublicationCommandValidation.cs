using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication
{
    public sealed class CreateDoctorPublicationCommandValidation : AbstractValidator<CreateDoctorPublicationCommand>
    {
        public CreateDoctorPublicationCommandValidation()
        {
            RuleForDoctorId();
            RuleForTitle();
            RuleForKeywords();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorPublication.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorPublication.EmptyDoctorId)
                .WithMessage("Doctor Id may not be empty.");
        }

        public void RuleForTitle()
        {
            RuleFor(cmd => cmd.NewDoctorPublication.Title)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorPublication.EmptyTitle)
                .WithMessage("Title may not be empty.");
        }

        public void RuleForKeywords()
        {
            RuleFor(cmd => cmd.NewDoctorPublication.Keywords)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.DoctorPublication.EmptyKeywords)
                .WithMessage("Keywords may not be empty.");
        }
    }
}