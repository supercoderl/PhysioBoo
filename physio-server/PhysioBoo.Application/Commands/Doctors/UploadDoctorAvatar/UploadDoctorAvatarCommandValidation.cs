using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.UploadDoctorAvatar
{
    public sealed class UploadDoctorAvatarCommandValidation : AbstractValidator<UploadDoctorAvatarCommand>
    {
        public UploadDoctorAvatarCommandValidation()
        {
            RuleFor(c => c.DoctorId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Doctor.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.File)
                .NotNull().WithErrorCode(DomainErrorCodes.Doctor.EmptyAvatarFile).WithMessage("File is required.");

            RuleFor(c => c.File.Length)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.Doctor.EmptyAvatarFile).WithMessage("File is empty.")
                .LessThanOrEqualTo(DoctorAvatarStorage.MaxFileSizeBytes).WithErrorCode(DomainErrorCodes.Doctor.AvatarFileTooLarge).WithMessage("Avatar may not exceed 5 MB.")
                .When(c => c.File != null);
        }
    }
}
