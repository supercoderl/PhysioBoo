using PhysioBoo.Application.ViewModels.Complaints;

namespace PhysioBoo.Application.Commands.Complaints.CreateComplaint
{
    public sealed class CreateComplaintCommand : CommandBase, IRequest
    {
        private static readonly CreateComplaintCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateComplaintViewModel NewComplaint { get; }

        public CreateComplaintCommand(Guid newId, CreateComplaintViewModel newComplaint) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewComplaint = newComplaint;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
