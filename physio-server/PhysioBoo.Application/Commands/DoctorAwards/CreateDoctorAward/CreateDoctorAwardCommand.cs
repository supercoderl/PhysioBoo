using MediatR;
using PhysioBoo.Application.ViewModels.DoctorAwards;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward
{
    public sealed class CreateDoctorAwardCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorAwardCommandValidation s_validation = new();

        public CreateDoctorAwardViewModel NewDoctorAward { get; }
        public Guid NewId { get; }

        public CreateDoctorAwardCommand(CreateDoctorAwardViewModel newDoctorAward, Guid newId) : base(Guid.NewGuid())
        {
            NewDoctorAward = newDoctorAward;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
