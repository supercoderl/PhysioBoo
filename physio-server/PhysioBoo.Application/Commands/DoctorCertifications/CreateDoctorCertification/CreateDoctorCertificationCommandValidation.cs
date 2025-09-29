using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification
{
    public sealed class CreateDoctorCertificationCommandValidation : AbstractValidator<CreateDoctorCertificationCommand>
    {
        public CreateDoctorCertificationCommandValidation()
        {
            RuleForDoctorId();
            RuleForCertificationName();
            RuleForIssuingOrganization();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorCertification.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorCertification.EmptyDoctorId).WithMessage("Doctor id may not be empty.");
        }

        public void RuleForCertificationName()
        {
            RuleFor(cmd => cmd.NewDoctorCertification.CertificationName).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorCertification.EmptyCertificationName).WithMessage("Certification name may not be empty.");
        }

        public void RuleForIssuingOrganization()
        {
            RuleFor(cmd => cmd.NewDoctorCertification.IssuingOrganization).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorCertification.EmptyIssuingOrganization).WithMessage("Issuing organization may not be empty.");
        }
    }
}
