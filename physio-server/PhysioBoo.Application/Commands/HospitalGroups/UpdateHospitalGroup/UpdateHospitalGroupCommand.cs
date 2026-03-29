using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup
{
    public sealed class UpdateHospitalGroupCommand : CommandBase, IRequest
    {
        private static readonly UpdateHospitalGroupCommandValidation s_validation = new();

        public UpdateHospitalGroupViewModel HospitalGroup { get; }

        public UpdateHospitalGroupCommand(UpdateHospitalGroupViewModel hospitalGroup) : base(Guid.NewGuid())
        {
            HospitalGroup = hospitalGroup;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
