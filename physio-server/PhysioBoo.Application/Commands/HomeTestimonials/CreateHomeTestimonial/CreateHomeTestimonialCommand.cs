using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeTestimonials.CreateHomeTestimonial
{
    public sealed class CreateHomeTestimonialCommand : CommandBase, IRequest
    {
        private static readonly CreateHomeTestimonialCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveHomeTestimonialViewModel HomeTestimonial { get; }

        public CreateHomeTestimonialCommand(Guid newId, SaveHomeTestimonialViewModel homeTestimonial) : base(Guid.NewGuid())
        {
            NewId = newId;
            HomeTestimonial = homeTestimonial;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
