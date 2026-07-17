using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sys_Languages;

namespace PhysioBoo.Application.ViewModels.Configurations
{
    public sealed class InitDataViewModel
    {
        public string Version { get; set; } = "1.0.0";
        public Dictionary<string, bool> Features { get; set; } = new();
        public List<RoleCacheViewModel> RegistrationRoles { get; set; } = new();
        public List<LanguageCacheViewModel> Languages { get; set; } = new();

        public static InitDataViewModel FromConfig(List<RoleCacheViewModel> roles, List<LanguageCacheViewModel> languages)
        {
            return new InitDataViewModel
            {
                Version = "1.0.0",
                Features = { },
                RegistrationRoles = roles,
                Languages = languages
            };
        }
    }
}
