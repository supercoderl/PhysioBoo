using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Admissions.CreateAdmission
{
    public sealed class CreateAdmissionCommandValidation : AbstractValidator<CreateAdmissionCommand>
    {
        public CreateAdmissionCommandValidation()
        {
            RuleFor(c => c.NewAdmission.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.NewAdmission.AdmissionType)
                .Must(v => Enum.TryParse(v, true, out AdmissionType t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Admission.InvalidType).WithMessage("Admission type is not valid.");

            RuleFor(c => c.NewAdmission.DepartmentId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyDepartmentId).WithMessage("Department may not be empty.");

            RuleFor(c => c.NewAdmission.DoctorId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyDoctorId).WithMessage("Doctor may not be empty.");

            RuleFor(c => c.NewAdmission.ReferredBy)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Admission.ReferredByExceedsMaxLength).WithMessage("Referred by may not exceed 120 characters.")
                .When(c => c.NewAdmission.ReferredBy != null);

            RuleFor(c => c.NewAdmission.ChiefComplaint)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyChiefComplaint).WithMessage("Chief complaint may not be empty.")
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.ChiefComplaintExceedsMaxLength).WithMessage("Chief complaint may not exceed 1000 characters.");

            RuleFor(c => c.NewAdmission.ProvisionalDiagnosis)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.EmptyProvisionalDiagnosis).WithMessage("Provisional diagnosis may not be empty.")
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.ProvisionalDiagnosisExceedsMaxLength).WithMessage("Provisional diagnosis may not exceed 1000 characters.");

            RuleFor(c => c.NewAdmission.Allergies)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Allergies may not exceed 1000 characters.")
                .When(c => c.NewAdmission.Allergies != null);

            RuleFor(c => c.NewAdmission.CurrentMedications)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Current medications may not exceed 1000 characters.")
                .When(c => c.NewAdmission.CurrentMedications != null);

            RuleFor(c => c.NewAdmission.MedicalHistory)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Medical history may not exceed 2000 characters.")
                .When(c => c.NewAdmission.MedicalHistory != null);

            RuleFor(c => c.NewAdmission.InsuranceProvider)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Admission.InsuranceDetailsRequired).WithMessage("Insurance provider is required when the patient has insurance.")
                .When(c => c.NewAdmission.HasInsurance);

            RuleFor(c => c.NewAdmission.InsuranceProvider)
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Insurance provider may not exceed 120 characters.")
                .When(c => c.NewAdmission.InsuranceProvider != null);

            RuleFor(c => c.NewAdmission.PolicyNumber)
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.Admission.TextExceedsMaxLength).WithMessage("Policy number may not exceed 64 characters.")
                .When(c => c.NewAdmission.PolicyNumber != null);
        }
    }
}
