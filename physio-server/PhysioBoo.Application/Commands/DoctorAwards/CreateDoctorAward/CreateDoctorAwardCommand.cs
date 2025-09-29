using MediatR;
using PhysioBoo.Application.ViewModels.DoctorAwards;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward
{
    public sealed class CreateDoctorAwardCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorAwardCommandValidation s_validation = new();

        public CreateDoctorAwardViewModel NewDoctorAward { get; }

        public CreateDoctorAwardCommand(CreateDoctorAwardViewModel newDoctorAward) : base(Guid.NewGuid())
        {
            NewDoctorAward = newDoctorAward;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
