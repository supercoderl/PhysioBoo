using MediatR;
using PhysioBoo.Application.ViewModels.Profiles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Profiles.CreateProfile
{
    public sealed class CreateProfileCommand : CommandBase, IRequest
    {
        private static readonly CreateProfileCommandValidation s_validation = new();

        public CreateProfileViewModel NewProfile { get; }
        public Guid UserId { get; }

        public CreateProfileCommand(CreateProfileViewModel newProfile, Guid userId) : base(Guid.NewGuid())
        {
            NewProfile = newProfile;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
