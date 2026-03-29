using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Hospitals.UpdateHospital
{
    public sealed class UpdateHospitalCommand : CommandBase, IRequest
    {
        private static readonly UpdateHospitalCommandValidation s_validation = new();

        public UpdateHospitalViewModel Hospital { get; }

        public UpdateHospitalCommand(
            UpdateHospitalViewModel hospital
        ) : base(Guid.NewGuid())
        {
            Hospital = hospital;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
