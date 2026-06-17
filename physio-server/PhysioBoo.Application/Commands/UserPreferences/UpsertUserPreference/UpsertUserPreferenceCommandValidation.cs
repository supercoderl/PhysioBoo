using FluentValidation;

namespace PhysioBoo.Application.Commands.UserPreferences.UpsertUserPreference
{
    public sealed class UpsertUserPreferenceCommandValidation : AbstractValidator<UpsertUserPreferenceCommand>
    {
        public UpsertUserPreferenceCommandValidation()
        {

        }
    }
}