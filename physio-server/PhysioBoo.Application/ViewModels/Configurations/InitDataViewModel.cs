using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.Configurations
{
    public sealed class InitDataViewModel
    {
        public string Version { get; set; } = "1.0.0";
        public Dictionary<string, bool> Features { get; set; } = new();
        public List<RoleViewModel> RegistrationRoles { get; set; } = new List<RoleViewModel>();
        public List<LanguageViewModel> Languages { get; set; } = new();

        public static InitDataViewModel FromConfig(List<Role> roles, List<Sys_Language> languages)
        {
            return new InitDataViewModel
            {
                Version = "1.0.0",
                Features = { },
                RegistrationRoles = roles.Select(r => new RoleViewModel
                {
                    Id = r.Id,
                    Name = r.Name,
                    Code = r.Code,
                    Description = r.Description,
                    Color = r.Color,
                    Icon = r.Icon,
                    IsSystemRole = r.IsSystemRole,
                    IsActive = r.IsActive,
                    CreatedAt = r.CreatedAt,
                    CreatedBy = r.CreatedBy,
                    UpdatedAt = r.UpdatedAt,
                    UpdatedBy = r.UpdatedBy
                }).ToList(),
                Languages = languages.Select(l => new LanguageViewModel
                {
                    Id = l.Id,
                    Name = l.Name,
                    Code = l.Code,
                    IsActive = l.IsActive,
                    FlagUrl = l.FlagUrl,
                    IsDefault = l.IsDefault,
                    NativeName = l.NativeName,
                    Index = l.Index
                }).ToList()
            };
        }
    }
}
