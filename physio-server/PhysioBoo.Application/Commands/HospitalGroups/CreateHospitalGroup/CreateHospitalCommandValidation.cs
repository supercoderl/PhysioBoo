using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup
{
    public sealed class CreateHospitalGroupCommandValidation : AbstractValidator<CreateHospitalGroupCommand>
    {
        public CreateHospitalGroupCommandValidation()
        {
            RuleForName();
            RuleForContact();
            RuleForEstablishedDate();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewHospitalGroup.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.NewHospitalGroup.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.NewHospitalGroup.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.NewHospitalGroup.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.NewHospitalGroup.LogoUrl).MaxLen(500, "Logo URL");
            RuleFor(cmd => cmd.NewHospitalGroup.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForEstablishedDate()
        {
            RuleFor(cmd => cmd.NewHospitalGroup.EstablishedDate)
                .LessThanOrEqualTo(_ => DateTime.UtcNow)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Established date may not be in the future.");
        }
    }
}
