using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.CollectLabSample
{
    public sealed class CollectLabSampleCommandValidation : AbstractValidator<CollectLabSampleCommand>
    {
        public CollectLabSampleCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.LabWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.CollectorName)
                .MaximumLength(150).WithErrorCode(DomainErrorCodes.LabWorkspace.CollectorNameExceedsMaxLength).WithMessage("Collector name may not exceed 150 characters.");

            RuleFor(c => c.Body.ContainerType)
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.LabWorkspace.ContainerTypeExceedsMaxLength).WithMessage("Container type may not exceed 64 characters.");
        }
    }
}
