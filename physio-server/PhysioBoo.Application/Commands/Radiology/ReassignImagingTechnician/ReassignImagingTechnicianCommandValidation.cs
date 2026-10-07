using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.ReassignImagingTechnician
{
    public sealed class ReassignImagingTechnicianCommandValidation : AbstractValidator<ReassignImagingTechnicianCommand>
    {
        public ReassignImagingTechnicianCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.TechnicianName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyTechnicianName).WithMessage("Technician name may not be empty.")
                .MaximumLength(150).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.TechnicianNameExceedsMaxLength).WithMessage("Technician name may not exceed 150 characters.");
        }
    }
}
