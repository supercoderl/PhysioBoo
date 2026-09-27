using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HospitalGroups.DeleteHospitalGroup
{
    public sealed class DeleteHospitalGroupCommandValidation : AbstractValidator<DeleteHospitalGroupCommand>
    {
        public DeleteHospitalGroupCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
