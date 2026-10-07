using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeTestimonials.DeleteHomeTestimonial
{
    public sealed class DeleteHomeTestimonialCommandValidation : AbstractValidator<DeleteHomeTestimonialCommand>
    {
        public DeleteHomeTestimonialCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeTestimonial.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
