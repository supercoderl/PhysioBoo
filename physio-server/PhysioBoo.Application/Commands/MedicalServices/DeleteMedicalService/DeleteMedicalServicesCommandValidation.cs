using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalServices.DeleteMedicalService
{
    public sealed class DeleteMedicalServiceCommandValidation : AbstractValidator<DeleteMedicalServiceCommand>
    {
        public DeleteMedicalServiceCommandValidation()
        {
            RuleFor(c => c.Ids)
                            .NotEmpty().WithErrorCode(DomainErrorCodes.MedicalService.EmptyIds).WithMessage("At least one id is required.");
        }
    }
}