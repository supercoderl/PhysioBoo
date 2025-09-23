using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommand : CommandBase, IRequest
    {
        private static readonly CreateHospitalCommandValidation s_validation = new();

        public CreateHospitalViewModel NewHospital { get; }

        public CreateHospitalCommand(CreateHospitalViewModel newHospital) : base(Guid.NewGuid())
        {
            NewHospital = newHospital;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
