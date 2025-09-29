using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommandValidation : AbstractValidator<CreateHospitalCommand>
    {
        public CreateHospitalCommandValidation()
        {
            RuleForHospitalGroupId();
            RuleForName();
            RuleForAddress();
            RuleForCity();
            RuleForStateProvince();
            RuleForCountry();
            RuleForAccreditationBody();
            RuleForInsuranceAccepted();
            RuleForLanguagesSupported();
        }

        public void RuleForHospitalGroupId()
        {
            RuleFor(cmd => cmd.NewHospital.HospitalGroupId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyHospitalGroupId)
                .WithMessage("HospitalGroupId may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewHospital.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyName)
                .WithMessage("Name may not be empty.");
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.NewHospital.Address)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAddress)
                .WithMessage("Address may not be empty.");
        }

        public void RuleForCity()
        {
            RuleFor(cmd => cmd.NewHospital.City)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCity)
                .WithMessage("City may not be empty.");
        }

        public void RuleForStateProvince()
        {
            RuleFor(cmd => cmd.NewHospital.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyStateProvince)
                .WithMessage("State/Province may not be empty.");
        }

        public void RuleForCountry()
        {
            RuleFor(cmd => cmd.NewHospital.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCountry)
                .WithMessage("Country may not be empty.");
        }

        public void RuleForAccreditationBody()
        {
            RuleFor(cmd => cmd.NewHospital.AccreditationBody)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAccreditationBody)
                .WithMessage("AccreditationBody may not be empty.");
        }

        public void RuleForInsuranceAccepted()
        {
            RuleFor(cmd => cmd.NewHospital.InsuranceAccepted)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyInsuranceAccepted)
                .WithMessage("InsuranceAccepted may not be empty.");
        }

        public void RuleForLanguagesSupported()
        {
            RuleFor(cmd => cmd.NewHospital.LanguagesSupported)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyLanguagesSupported)
                .WithMessage("LanguagesSupported may not be empty.");
        }
    }
}
