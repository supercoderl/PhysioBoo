using Microsoft.AspNetCore.Http;

namespace PhysioBoo.Application.Commands.Doctors.UploadDoctorAvatar
{
    public sealed class UploadDoctorAvatarCommand : CommandBase, IRequest
    {
        private static readonly UploadDoctorAvatarCommandValidation s_validation = new();

        public Guid DoctorId { get; }
        public IFormFile File { get; }

        /// <summary>
        /// Set by the handler: the url the avatar is now served from.
        /// </summary>
        public string? AvatarUrl { get; set; }

        public UploadDoctorAvatarCommand(Guid doctorId, IFormFile file) : base(doctorId)
        {
            DoctorId = doctorId;
            File = file;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
