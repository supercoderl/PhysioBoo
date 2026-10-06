using PhysioBoo.Application.ViewModels.Complaints;

namespace PhysioBoo.Application.Commands.Complaints.UpdateComplaint
{
    public sealed class UpdateComplaintCommand : CommandBase, IRequest
    {
        private static readonly UpdateComplaintCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateComplaintViewModel Complaint { get; }

        public UpdateComplaintCommand(Guid id, UpdateComplaintViewModel complaint) : base(Guid.NewGuid())
        {
            Id = id;
            Complaint = complaint;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
