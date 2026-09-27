using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Hospitals.DeleteHospital
{
    public sealed class DeleteHospitalCommandValidation : AbstractValidator<DeleteHospitalCommand>
    {
        public DeleteHospitalCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
