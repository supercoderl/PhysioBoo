using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.CreateSurgery
{
    public sealed class CreateSurgeryCommandValidation : AbstractValidator<CreateSurgeryCommand>
    {
        public CreateSurgeryCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.NewSurgery.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyPatientId).WithMessage("Patient id may not be empty.");

            RuleFor(c => c.NewSurgery.OperatingRoomId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyRoomId).WithMessage("Operating room id may not be empty.");

            RuleFor(c => c.NewSurgery.Procedure)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyProcedure).WithMessage("Procedure is required.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Procedure may not exceed 200 characters.");

            RuleFor(c => c.NewSurgery.SurgeryType)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyName).WithMessage("Surgery type is required.")
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Surgery type may not exceed 100 characters.");

            RuleFor(c => c.NewSurgery.Diagnosis)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyDiagnosis).WithMessage("Diagnosis is required.")
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Diagnosis may not exceed 1000 characters.");

            RuleFor(c => c.NewSurgery.RiskAssessment)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Risk assessment may not exceed 1000 characters.")
                .When(c => c.NewSurgery.RiskAssessment != null);

            RuleFor(c => c.NewSurgery.ScheduledStart)
                .NotEqual(default(DateTime)).WithErrorCode(DomainErrorCodes.Surgery.InvalidValue).WithMessage("Scheduled start is required.");

            // The room clash check assumes a case never runs longer than a day.
            RuleFor(c => c.NewSurgery.EstimatedDurationMinutes)
                .InclusiveBetween(5, 1440).WithErrorCode(DomainErrorCodes.Surgery.InvalidDuration).WithMessage("Duration must be between 5 and 1440 minutes.");

            RuleFor(c => c.NewSurgery.Priority)
                .Must(v => Enum.TryParse(v, true, out SurgeryPriority _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidPriority).WithMessage("Priority is not valid.");

            RuleFor(c => c.NewSurgery.ConsentStatus)
                .Must(v => Enum.TryParse(v, true, out ConsentStatus _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidConsentStatus).WithMessage("Consent status is not valid.")
                .When(c => !string.IsNullOrWhiteSpace(c.NewSurgery.ConsentStatus));

            RuleForEach(c => c.NewSurgery.Team)
                .ChildRules(member =>
                {
                    member.RuleFor(m => m.StaffId)
                        .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyStaffId).WithMessage("Staff id may not be empty.");
                    member.RuleFor(m => m.Role)
                        .Must(v => Enum.TryParse(v, true, out SurgicalTeamRole _))
                        .WithErrorCode(DomainErrorCodes.Surgery.InvalidRole).WithMessage("Role is not valid.");
                })
                .When(c => c.NewSurgery.Team != null);

            RuleForEach(c => c.NewSurgery.Equipment)
                .ChildRules(item =>
                {
                    item.RuleFor(e => e.Name)
                        .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyName).WithMessage("Equipment name is required.")
                        .MaximumLength(200).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Equipment name may not exceed 200 characters.");
                    item.RuleFor(e => e.Category)
                        .Must(v => Enum.TryParse(v, true, out EquipmentCategory _))
                        .WithErrorCode(DomainErrorCodes.Surgery.InvalidCategory).WithMessage("Equipment category is not valid.");
                    item.RuleFor(e => e.Quantity)
                        .InclusiveBetween(1, 1000).WithErrorCode(DomainErrorCodes.Surgery.InvalidQuantity).WithMessage("Quantity must be between 1 and 1000.");
                })
                .When(c => c.NewSurgery.Equipment != null);
        }
    }
}
