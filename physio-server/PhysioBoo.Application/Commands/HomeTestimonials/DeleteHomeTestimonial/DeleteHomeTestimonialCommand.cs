namespace PhysioBoo.Application.Commands.HomeTestimonials.DeleteHomeTestimonial
{
    public sealed class DeleteHomeTestimonialCommand : CommandBase, IRequest
    {
        private static readonly DeleteHomeTestimonialCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteHomeTestimonialCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
