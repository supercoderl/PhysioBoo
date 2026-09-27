using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.UserPreferences.UpsertUserPreference
{
    public sealed class UpsertUserPreferenceCommandValidation : AbstractValidator<UpsertUserPreferenceCommand>
    {
        public UpsertUserPreferenceCommandValidation()
        {
            RuleForPreferences();
        }

        public void RuleForPreferences()
        {
            RuleFor(cmd => cmd.UserPreferences.Preferences)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Preferences may not be empty.");

            RuleForEach(cmd => cmd.UserPreferences.Preferences).ChildRules(item =>
            {
                item.RuleFor(p => p.Key)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Validation.Required)
                    .WithMessage("Preference key may not be empty.");

                item.RuleFor(p => p.Group)
                    .NotEmpty()
                    .WithErrorCode(DomainErrorCodes.Validation.Required)
                    .WithMessage("Preference group may not be empty.");
            });

            RuleFor(cmd => cmd.UserPreferences.Preferences)
                .Must(items => items.Select(p => (p.Group, p.Key)).Distinct().Count() == items.Count)
                .When(cmd => cmd.UserPreferences.Preferences is { Count: > 0 })
                .WithErrorCode(DomainErrorCodes.Validation.DuplicateKey)
                .WithMessage("Preferences may not contain duplicate keys within a group.");
        }
    }
}
