using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Complaints.DeleteComplaint
{
    public sealed class DeleteComplaintCommandValidation : AbstractValidator<DeleteComplaintCommand>
    {
        public DeleteComplaintCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Complaint.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
