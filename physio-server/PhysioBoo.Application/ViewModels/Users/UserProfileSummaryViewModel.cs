using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed class UserProfileSummaryViewModel
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public bool IsVerified { get; set; }
        public List<string> Roles { get; set; } = new();
        public List<string> Permissions { get; set; } = new();

        public string FullName => FirstName + LastName;

        public static UserProfileSummaryViewModel FromEntity(User user)
        {
            return new UserProfileSummaryViewModel
            {
                Id = user.Id,
                FirstName = user.Profile?.FirstName ?? string.Empty,
                LastName = user.Profile?.LastName ?? string.Empty,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.ProfilePicture,
                IsVerified = user.IsVerified,
                Roles = user.UserRoles
                    .Where(ur => ur.Role != null)
                    .Select(ur => ur.Role!.Code)
                    .ToList(),
                Permissions = user.UserRoles
                    .Where(ur => ur.Role != null)
                    .SelectMany(ur => ur.Role!.RolePermissions)
                    .Where(rp => rp.Permission != null)
                    .Select(rp => rp.Permission!.Code)
                    .ToList()
            };
        }
    }
}
