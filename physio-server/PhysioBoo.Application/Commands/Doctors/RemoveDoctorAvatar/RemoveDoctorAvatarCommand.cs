using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.RemoveDoctorAvatar
{
    public sealed class RemoveDoctorAvatarCommand : CommandBase, IRequest
    {
        private static readonly RemoveDoctorAvatarCommandValidation s_validation = new();

        public Guid DoctorId { get; }

        public RemoveDoctorAvatarCommand(Guid doctorId) : base(doctorId)
        {
            DoctorId = doctorId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }

    public sealed class RemoveDoctorAvatarCommandValidation : AbstractValidator<RemoveDoctorAvatarCommand>
    {
        public RemoveDoctorAvatarCommandValidation()
        {
            RuleFor(c => c.DoctorId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Doctor.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
