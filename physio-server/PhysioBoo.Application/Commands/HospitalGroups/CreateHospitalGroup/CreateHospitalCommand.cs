using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup
{
    public sealed class CreateHospitalGroupCommand : CommandBase, IRequest
    {
        private static readonly CreateHospitalGroupCommandValidation s_validation = new();

        public CreateHospitalGroupViewModel NewHospitalGroup { get; }
        public Guid NewId { get; }

        public CreateHospitalGroupCommand(CreateHospitalGroupViewModel newHospitalGroup, Guid newId) : base(Guid.NewGuid())
        {
            NewHospitalGroup = newHospitalGroup;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
