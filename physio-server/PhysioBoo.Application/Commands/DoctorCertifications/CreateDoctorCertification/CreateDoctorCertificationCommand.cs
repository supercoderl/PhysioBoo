using MediatR;
using PhysioBoo.Application.ViewModels.DoctorCertifications;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification
{
    public sealed class CreateDoctorCertificationCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorCertificationCommandValidation s_validation = new();

        public CreateDoctorCertificationViewModel NewDoctorCertification { get; }

        public CreateDoctorCertificationCommand(CreateDoctorCertificationViewModel newDoctorCertification) : base(Guid.NewGuid())
        {
            NewDoctorCertification = newDoctorCertification;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
