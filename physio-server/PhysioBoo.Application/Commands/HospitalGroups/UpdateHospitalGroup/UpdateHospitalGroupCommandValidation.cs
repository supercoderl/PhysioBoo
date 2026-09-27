using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup
{
    public sealed class UpdateHospitalGroupCommandValidation : AbstractValidator<UpdateHospitalGroupCommand>
    {
        public UpdateHospitalGroupCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForContact();
            RuleForEstablishedDate();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.HospitalGroup.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.HospitalGroup.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.HospitalGroup.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.HospitalGroup.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.HospitalGroup.LogoUrl).MaxLen(500, "Logo URL");
            RuleFor(cmd => cmd.HospitalGroup.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForEstablishedDate()
        {
            RuleFor(cmd => cmd.HospitalGroup.EstablishedDate)
                .LessThanOrEqualTo(_ => DateTime.UtcNow)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Established date may not be in the future.");
        }
    }
}
