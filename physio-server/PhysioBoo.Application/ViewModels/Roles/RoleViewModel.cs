
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Roles
{
    public sealed class RoleViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public bool IsSystemRole { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }

        public static RoleViewModel FromRole(Role role)
        {
            return new RoleViewModel
            {
                Id = role.Id,
                Name = role.Name,
                Code = role.Code,
                Description = role.Description,
                Color = role.Color,
                Icon = role.Icon,
                IsSystemRole = role.IsSystemRole,
                IsActive = role.IsActive,
                CreatedAt = role.CreatedAt,
                CreatedBy = role.CreatedBy,
                UpdatedAt = role.UpdatedAt,
                UpdatedBy = role.UpdatedBy
            };
        }
    }
}
