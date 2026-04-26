using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup
{
    public sealed class UpdateHospitalGroupCommand : CommandBase, IRequest
    {
        private static readonly UpdateHospitalGroupCommandValidation s_validation = new();

        public UpdateHospitalGroupViewModel HospitalGroup { get; }
        public Guid Id { get; }

        public UpdateHospitalGroupCommand(UpdateHospitalGroupViewModel hospitalGroup, Guid id) : base(Guid.NewGuid())
        {
            HospitalGroup = hospitalGroup;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
