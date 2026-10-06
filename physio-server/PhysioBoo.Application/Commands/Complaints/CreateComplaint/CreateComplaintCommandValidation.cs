using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Complaints.CreateComplaint
{
    public sealed class CreateComplaintCommandValidation : AbstractValidator<CreateComplaintCommand>
    {
        public CreateComplaintCommandValidation()
        {
            RuleFor(c => c.NewComplaint.PatientName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyPatientName).WithMessage("Patient name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Complaint.PatientNameExceedsMaxLength).WithMessage("Patient name may not exceed 120 characters.");

            RuleFor(c => c.NewComplaint.PatientId)
                .Must(v => string.IsNullOrWhiteSpace(v) || Guid.TryParse(v, out _))
                .WithErrorCode(DomainErrorCodes.Complaint.InvalidPatientId).WithMessage("Patient id is not valid.");

            RuleFor(c => c.NewComplaint.Email)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyEmail).WithMessage("Email may not be empty.")
                .EmailAddress().WithErrorCode(DomainErrorCodes.Complaint.InvalidEmail).WithMessage("Email is not valid.")
                .MaximumLength(254).WithErrorCode(DomainErrorCodes.Complaint.EmailExceedsMaxLength).WithMessage("Email may not exceed 254 characters.");

            RuleFor(c => c.NewComplaint.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyPhone).WithMessage("Phone may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Complaint.PhoneExceedsMaxLength).WithMessage("Phone may not exceed 32 characters.");

            RuleFor(c => c.NewComplaint.Category)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Complaint.InvalidCategory).WithMessage("Category is not valid.");

            RuleFor(c => c.NewComplaint.Priority)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Complaint.InvalidPriority).WithMessage("Priority is not valid.");

            RuleFor(c => c.NewComplaint.Subject)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptySubject).WithMessage("Subject may not be empty.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Complaint.SubjectExceedsMaxLength).WithMessage("Subject may not exceed 200 characters.");

            RuleFor(c => c.NewComplaint.Description)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyDescription).WithMessage("Description may not be empty.")
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Complaint.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 4000 characters.");

            RuleFor(c => c.NewComplaint.AssignedTo)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Complaint.AssignedToExceedsMaxLength).WithMessage("Assigned to may not exceed 120 characters.")
                .When(c => c.NewComplaint.AssignedTo != null);
        }
    }
}
