using FluentValidation;

namespace PhysioBoo.Application.Commands.Profiles.CreateProfile
{
    public sealed class CreateProfileCommandValidation : AbstractValidator<CreateProfileCommand>
    {
        public CreateProfileCommandValidation()
        {

        }
    }
}
