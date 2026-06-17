using MediatR;
using PhysioBoo.Application.ViewModels.UserPreferences;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.UserPreferences.UpsertUserPreference
{
    public sealed class UpsertUserPreferenceCommand : CommandBase, IRequest
    {
        private static readonly UpsertUserPreferenceCommandValidation s_validation = new();

        public UpsertUserPreferenceViewModel UserPreferences { get; }

        public UpsertUserPreferenceCommand(UpsertUserPreferenceViewModel userPreferences) : base(Guid.NewGuid())
        {
            UserPreferences = userPreferences;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
