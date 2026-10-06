using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Admissions.UpdateAdmission
{
    public sealed class UpdateAdmissionCommandValidation : AbstractValidator<UpdateAdmissionCommand>
    {
        public UpdateAdmissionCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Admission.AdmissionType)
                .Must(v => Enum.TryParse(v, true, out AdmissionType t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Admission.InvalidType).WithMessage("Admission type is not valid.");

            RuleFor(c => c.Admission.DepartmentId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyDepartmentId).WithMessage("Department may not be empty.");

            RuleFor(c => c.Admission.DoctorId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyDoctorId).WithMessage("Doctor may not be empty.");

            RuleFor(c => c.Admission.ReferredBy)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Admission.ReferredByExceedsMaxLength).WithMessage("Referred by may not exceed 120 characters.")
                .When(c => c.Admission.ReferredBy != null);

            RuleFor(c => c.Admission.ChiefComplaint)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyChiefComplaint).WithMessage("Chief complaint may not be empty.")
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.ChiefComplaintExceedsMaxLength).WithMessage("Chief complaint may not exceed 1000 characters.");

            RuleFor(c => c.Admission.ProvisionalDiagnosis)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyProvisionalDiagnosis).WithMessage("Provisional diagnosis may not be empty.")
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.ProvisionalDiagnosisExceedsMaxLength).WithMessage("Provisional diagnosis may not exceed 1000 characters.");

            RuleFor(c => c.Admission.Allergies)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Allergies may not exceed 1000 characters.")
                .When(c => c.Admission.Allergies != null);

            RuleFor(c => c.Admission.CurrentMedications)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Current medications may not exceed 1000 characters.")
                .When(c => c.Admission.CurrentMedications != null);

            RuleFor(c => c.Admission.MedicalHistory)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Medical history may not exceed 2000 characters.")
                .When(c => c.Admission.MedicalHistory != null);

            RuleFor(c => c.Admission.InsuranceProvider)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.InsuranceDetailsRequired).WithMessage("Insurance provider is required when the patient has insurance.")
                .When(c => c.Admission.HasInsurance);

            RuleFor(c => c.Admission.InsuranceProvider)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Insurance provider may not exceed 120 characters.")
                .When(c => c.Admission.InsuranceProvider != null);

            RuleFor(c => c.Admission.PolicyNumber)
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Policy number may not exceed 64 characters.")
                .When(c => c.Admission.PolicyNumber != null);
        }
    }
}
