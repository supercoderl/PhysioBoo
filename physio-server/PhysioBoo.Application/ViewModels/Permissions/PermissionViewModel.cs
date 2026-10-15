using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Permissions
{
    public sealed class PermissionViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }

        /// <summary>Grouping label for the role matrix: the module segment of the code ("iam" for "iam:user:read").</summary>
        public string Category => Code.Split(':', 2)[0];

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
