using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.Sys_Settings
{
    public sealed class SettingViewModel
    {
        public Guid Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Group { get; set; } = string.Empty;
        public bool IsSystem { get; set; }
        public string InputType { get; set; } = string.Empty;
        public bool IsEncrypted { get; set; }

        public static SettingViewModel FromSetting(Sys_Setting setting)
        {
            return new SettingViewModel
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description,
                Group = setting.Group,
                IsSystem = setting.IsSystem,
                InputType = setting.InputType,
                IsEncrypted = setting.IsEncrypted
            };
        }
    }
}
