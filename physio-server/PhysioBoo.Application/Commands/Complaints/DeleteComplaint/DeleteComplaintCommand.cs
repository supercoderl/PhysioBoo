namespace PhysioBoo.Application.Commands.Complaints.DeleteComplaint
{
    public sealed class DeleteComplaintCommand : CommandBase, IRequest
    {
        private static readonly DeleteComplaintCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteComplaintCommand(Guid id, bool isHard) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
