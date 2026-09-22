using PhysioBoo.Application.ViewModels.HomeSettings;

namespace PhysioBoo.Application.Commands.HomeSettings.UpdateHomeSetting
{
    public sealed class UpdateHomeSettingCommand : CommandBase, IRequest
    {
        private static readonly UpdateHomeSettingCommandValidation s_validation = new();

        public UpdateHomeSettingViewModel HomeSetting { get; }

        public UpdateHomeSettingCommand(UpdateHomeSettingViewModel homeSetting) : base(Guid.NewGuid())
        {
            HomeSetting = homeSetting;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
