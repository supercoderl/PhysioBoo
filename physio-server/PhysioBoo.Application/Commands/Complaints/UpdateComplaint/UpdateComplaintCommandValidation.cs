using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Complaints.UpdateComplaint
{
    public sealed class UpdateComplaintCommandValidation : AbstractValidator<UpdateComplaintCommand>
    {
        public UpdateComplaintCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Complaint.PatientName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyPatientName).WithMessage("Patient name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Complaint.PatientNameExceedsMaxLength).WithMessage("Patient name may not exceed 120 characters.");

            RuleFor(c => c.Complaint.PatientId)
                .Must(v => string.IsNullOrWhiteSpace(v) || Guid.TryParse(v, out _))
                .WithErrorCode(DomainErrorCodes.Complaint.InvalidPatientId).WithMessage("Patient id is not valid.");

            RuleFor(c => c.Complaint.Email)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyEmail).WithMessage("Email may not be empty.")
                .EmailAddress().WithErrorCode(DomainErrorCodes.Complaint.InvalidEmail).WithMessage("Email is not valid.")
                .MaximumLength(254).WithErrorCode(DomainErrorCodes.Complaint.EmailExceedsMaxLength).WithMessage("Email may not exceed 254 characters.");

            RuleFor(c => c.Complaint.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyPhone).WithMessage("Phone may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Complaint.PhoneExceedsMaxLength).WithMessage("Phone may not exceed 32 characters.");

            RuleFor(c => c.Complaint.Category)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Complaint.InvalidCategory).WithMessage("Category is not valid.");

            RuleFor(c => c.Complaint.Priority)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Complaint.InvalidPriority).WithMessage("Priority is not valid.");

            RuleFor(c => c.Complaint.Status)
                .IsInEnum().WithErrorCode(DomainErrorCodes.Complaint.InvalidStatus).WithMessage("Status is not valid.");

            RuleFor(c => c.Complaint.Subject)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptySubject).WithMessage("Subject may not be empty.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Complaint.SubjectExceedsMaxLength).WithMessage("Subject may not exceed 200 characters.");

            RuleFor(c => c.Complaint.Description)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyDescription).WithMessage("Description may not be empty.")
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Complaint.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 4000 characters.");

            RuleFor(c => c.Complaint.AssignedTo)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Complaint.AssignedToExceedsMaxLength).WithMessage("Assigned to may not exceed 120 characters.")
                .When(c => c.Complaint.AssignedTo != null);
        }
    }
}
