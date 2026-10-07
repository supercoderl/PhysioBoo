using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeTestimonials.UpdateHomeTestimonial
{
    public sealed class UpdateHomeTestimonialCommandValidation : AbstractValidator<UpdateHomeTestimonialCommand>
    {
        public UpdateHomeTestimonialCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeTestimonial.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.HomeTestimonial.PatientName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeTestimonial.EmptyPatientName).WithMessage("PatientName may not be empty.")
                .When(c => c.HomeTestimonial.PatientName != null);

            RuleFor(c => c.HomeTestimonial.PatientName)
                .MaximumLength(150).WithErrorCode(DomainErrorCodes.HomeTestimonial.PatientNameExceedsMaxLength).WithMessage("PatientName may not exceed 150 characters.");

            RuleFor(c => c.HomeTestimonial.Rating)
                .InclusiveBetween(1, 5).WithErrorCode(DomainErrorCodes.HomeTestimonial.InvalidRating).WithMessage("Rating must be between 1 and 5.")
                .When(c => c.HomeTestimonial.Rating != null);

            RuleFor(c => c.HomeTestimonial.Comment)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.HomeTestimonial.CommentExceedsMaxLength).WithMessage("Comment may not exceed 2000 characters.");
        }
    }
}
