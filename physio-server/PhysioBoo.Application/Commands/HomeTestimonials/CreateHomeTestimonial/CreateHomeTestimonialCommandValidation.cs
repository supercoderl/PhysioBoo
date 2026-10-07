using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeTestimonials.CreateHomeTestimonial
{
    public sealed class CreateHomeTestimonialCommandValidation : AbstractValidator<CreateHomeTestimonialCommand>
    {
        public CreateHomeTestimonialCommandValidation()
        {
            RuleFor(c => c.HomeTestimonial.PatientName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeTestimonial.EmptyPatientName).WithMessage("PatientName may not be empty.")
                .MaximumLength(150).WithErrorCode(DomainErrorCodes.HomeTestimonial.PatientNameExceedsMaxLength).WithMessage("PatientName may not exceed 150 characters.");

            RuleFor(c => c.HomeTestimonial.Rating)
                .NotNull().WithErrorCode(DomainErrorCodes.HomeTestimonial.InvalidRating).WithMessage("Rating is required.")
                .InclusiveBetween(1, 5).WithErrorCode(DomainErrorCodes.HomeTestimonial.InvalidRating).WithMessage("Rating must be between 1 and 5.");

            RuleFor(c => c.HomeTestimonial.Comment)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.HomeTestimonial.CommentExceedsMaxLength).WithMessage("Comment may not exceed 2000 characters.");
        }
    }
}
