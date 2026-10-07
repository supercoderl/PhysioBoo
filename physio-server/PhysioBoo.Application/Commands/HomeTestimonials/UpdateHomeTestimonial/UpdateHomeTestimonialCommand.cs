using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeTestimonials.UpdateHomeTestimonial
{
    public sealed class UpdateHomeTestimonialCommand : CommandBase, IRequest
    {
        private static readonly UpdateHomeTestimonialCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveHomeTestimonialViewModel HomeTestimonial { get; }

        public UpdateHomeTestimonialCommand(Guid id, SaveHomeTestimonialViewModel homeTestimonial) : base(Guid.NewGuid())
        {
            Id = id;
            HomeTestimonial = homeTestimonial;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
