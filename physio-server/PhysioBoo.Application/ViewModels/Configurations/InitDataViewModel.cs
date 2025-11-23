using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Configurations
{
    public sealed class InitDataViewModel
    {
        public string Version { get; set; } = "1.0.0";
        public Dictionary<string, bool> Features { get; set; } = new();
        public List<RoleViewModel> RegistrationRoles { get; set; } = new List<RoleViewModel>();

        public static InitDataViewModel FromConfig(List<Role> roles)
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
                }).ToList()
            };
        }
    }
}
