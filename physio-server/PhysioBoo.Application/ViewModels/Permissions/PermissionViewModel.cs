using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Permissions
{
    public sealed class PermissionViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }

        public static PermissionViewModel FromPermission(Permission permission)
        {
            return new PermissionViewModel
            {
                Id = permission.Id,
                Name = permission.Name,
                Code = permission.Code,
                Description = permission.Description
            };
        }
    }
}
