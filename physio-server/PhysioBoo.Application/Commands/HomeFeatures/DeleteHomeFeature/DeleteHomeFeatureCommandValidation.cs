using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeFeatures.DeleteHomeFeature
{
    public sealed class DeleteHomeFeatureCommandValidation : AbstractValidator<DeleteHomeFeatureCommand>
    {
        public DeleteHomeFeatureCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeFeature.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
